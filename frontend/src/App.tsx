import { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./abi/GameCharacterNFT-abi.json";
import "./App.css";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [tokenURI, setTokenURI] = useState("");
  const [myTokens, setMyTokens] = useState<
    { tokenId: number; tokenURI: string }[]
  >([]);
  const [status, setStatus] = useState("");

  // 메타마스크 연결
  const connectWallet = async () => {
    if ((window as any).ethereum) {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } else {
      alert("MetaMask를 설치해주세요!");
    }
  };

  // NFT 민팅
  const mintNFT = async () => {
    if (!account || !tokenURI) return;
    setMinting(true);
    setStatus("");
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.mint(account, tokenURI);
      await tx.wait();
      setStatus("민팅 성공!");
      setTokenURI("");
      fetchMyTokens();
    } catch (err) {
      setStatus("민팅 실패: " + (err as any).message);
    }
    setMinting(false);
  };

  // 내 NFT 목록 조회
  const fetchMyTokens = async () => {
    if (!account) return;
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
      const balance: bigint = await contract.balanceOf(account);
      const tokens: { tokenId: number; tokenURI: string }[] = [];
      for (let i = 0; i < Number(balance); i++) {
        // ERC721 표준에는 토큰 id를 직접 나열하는 함수가 없으므로, 일반적으로 tokenOfOwnerByIndex를 사용하지만, 이 컨트랙트에는 없음
        // 따라서 0~nextTokenId-1까지 ownerOf로 소유자 확인
        const nextTokenId: bigint = await contract.nextTokenId();
        for (let tokenId = 0; tokenId < Number(nextTokenId); tokenId++) {
          try {
            const owner = await contract.ownerOf(tokenId);
            if (owner.toLowerCase() === account.toLowerCase()) {
              const uri = await contract.tokenURI(tokenId);
              tokens.push({ tokenId, tokenURI: uri });
            }
          } catch {}
        }
        break; // 이미 다 찾았으므로 루프 종료
      }
      setMyTokens(tokens);
    } catch (err) {
      setStatus("NFT 조회 실패: " + (err as any).message);
    }
  };

  useEffect(() => {
    if (account) fetchMyTokens();
    // eslint-disable-next-line
  }, [account]);

  return (
    <div style={{ padding: 32 }}>
      <h1>Game Character NFT DApp</h1>
      {account ? (
        <div>
          <div>지갑: {account}</div>
          <input
            type="text"
            placeholder="메타데이터 JSON URL"
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            style={{ width: 400 }}
          />
          <button
            onClick={mintNFT}
            disabled={minting}
            style={{ marginLeft: 8 }}
          >
            {minting ? "민팅 중..." : "NFT 민팅"}
          </button>
          <div
            style={{
              color: status.startsWith("민팅 성공") ? "green" : "red",
              marginTop: 8,
            }}
          >
            {status}
          </div>
          <h2 style={{ marginTop: 32 }}>내 NFT 목록</h2>
          <button onClick={fetchMyTokens}>NFT 새로고침</button>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              marginTop: 16,
            }}
          >
            {myTokens.map((t) => (
              <div
                key={t.tokenId}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: 16,
                  width: 260,
                }}
              >
                <div>Token ID: {t.tokenId}</div>
                <div style={{ wordBreak: "break-all", fontSize: 12 }}>
                  {t.tokenURI}
                </div>
                {/* 이미지 및 속성 표시 */}
                <NFTPreview tokenURI={t.tokenURI} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button onClick={connectWallet}>메타마스크 연결</button>
      )}
    </div>
  );
}

// NFT 메타데이터를 fetch해서 이미지/속성 표시
function NFTPreview({ tokenURI }: { tokenURI: string }) {
  const [meta, setMeta] = useState<any>(null);
  useEffect(() => {
    if (!tokenURI) return;
    fetch(tokenURI)
      .then((res) => res.json())
      .then(setMeta)
      .catch(() => setMeta(null));
  }, [tokenURI]);
  if (!meta)
    return <div style={{ color: "#888" }}>메타데이터 불러오는 중...</div>;
  return (
    <div style={{ marginTop: 8 }}>
      {meta.image && (
        <img
          src={meta.image}
          alt={meta.name}
          style={{ width: 200, borderRadius: 8 }}
        />
      )}
      <div>
        <b>{meta.name}</b>
      </div>
      <div style={{ fontSize: 12 }}>{meta.description}</div>
      {meta.attributes && (
        <ul style={{ fontSize: 12, paddingLeft: 16 }}>
          {meta.attributes.map((attr: any, i: number) => (
            <li key={i}>
              {attr.trait_type}: {attr.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;

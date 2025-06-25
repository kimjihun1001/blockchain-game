import { ethers } from "hardhat";
import { expect } from "chai";

describe("GameCharacterNFT", function () {
  it("NFT를 민팅하고 owner를 확인할 수 있다", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const GameCharacterNFT = await ethers.getContractFactory(
      "GameCharacterNFT"
    );
    const gameCharacterNFT = await GameCharacterNFT.deploy();
    await gameCharacterNFT.waitForDeployment();

    // 민팅
    const tokenURI = "https://example.com/metadata/1.json";
    await gameCharacterNFT.mint(addr1.address, tokenURI);

    // owner 확인
    const ownerOfToken = await gameCharacterNFT.ownerOf(0);
    expect(ownerOfToken).to.equal(addr1.address);

    // tokenURI 확인
    const uri = await gameCharacterNFT.tokenURI(0);
    expect(uri).to.equal(tokenURI);
  });
});

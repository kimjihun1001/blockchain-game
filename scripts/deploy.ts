import { ethers } from "hardhat";

async function main() {
  const GameCharacterNFT = await ethers.getContractFactory("GameCharacterNFT");
  const gameCharacterNFT = await GameCharacterNFT.deploy();

  await gameCharacterNFT.waitForDeployment();

  console.log(
    `GameCharacterNFT deployed to: ${await gameCharacterNFT.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

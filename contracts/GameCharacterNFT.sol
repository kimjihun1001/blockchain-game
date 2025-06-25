// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameCharacterNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    constructor() ERC721("GameCharacter", "CHAR") Ownable(msg.sender) {}

    function mint(address to, string memory tokenURI) public onlyOwner {
        _safeMint(to, nextTokenId);
        _setTokenURI(nextTokenId, tokenURI);
        nextTokenId++;
    }
}
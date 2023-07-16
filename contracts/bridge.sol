// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract SberBridge is ERC1155, ERC1155Holder, Ownable{
    constructor() ERC1155("") {}

    string public name = "SberBridge";

    uint public priceForMinting = 1000000000000000;
    uint public priceForUnfreezeing = 1000000000000000;

    uint tokensAmount=0;
    mapping (uint => string) tokenMeta;
    event newToken(address creator, uint id);

    function mintNft(string calldata _meta) external payable {
        require(msg.value==priceForMinting, "Add funds");
        tokenMeta[tokensAmount] = _meta;
        _mint(msg.sender, tokensAmount, 1, "");
        emit newToken(msg.sender, tokensAmount);
        tokensAmount++;
    }

    function uri(uint256 tokenId) override public view returns (string memory){
        return(tokenMeta[tokenId]);
    }

    function freezeToken(address sc, uint id) external{
        ERC1155 token = ERC1155(_sc);
        require(token.balanceOf(msg.sender, _id)>0, "You must own the token");
        require(token.isApprovedForAll(msg.sender, address(this)), "Bridge must be approved");
        token.safeTransferFrom(msg.sender, address(this), _id, 1, "");
    }

    bytes public secretPhrase = bytes("onlyforadmin");

    function unfreezeToken(address sc, uint id, bytes calldata _phrase) external payable{
        require(keccak256(_phrase) == keccak256(secretPhrase), "Not an app interaction");
        require(msg.value==priceForUnfreezeing, "Add funds");
        ERC1155 token = ERC1155(_sc);
        token.safeTransferFrom(address(this), msg.sender, _id, 1, "");
    }

    function changeSecretPhrase (string calldata _new) external onlyOwner{
        secretPhrase = bytes(_new);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual  override(ERC1155, ERC1155Receiver) returns (bool) {
        return
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IERC1155MetadataURI).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId || 
            super.supportsInterface(interfaceId);
    }

    function withdraw() external onlyOwner{
        require(address(this).balance > 0, "Balance is 0");
        payable(owner()).transfer(address(this).balance);
    }


}
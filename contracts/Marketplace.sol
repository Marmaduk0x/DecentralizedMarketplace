pragma solidity ^0.8.0;

contract DecentralizedMarketplace {
    event ItemListed(address indexed owner, uint itemId, uint price);
    event ItemPurchased(address indexed buyer, uint itemId, uint price);
    struct Item {
        address payable seller;
        uint price;
        address owner;
        bool listed;
    }
    mapping(uint => Item) public items;
    uint public itemCount;
    modifier onlySeller(uint itemId) {
        require(msg.sender == items[itemId].seller, "Caller is not the seller");
        _;
    }
    modifier exists(uint itemId) {
        require(itemId < itemCount, "Item does not exist");
        _;
    }
    modifier isListed(uint itemId) {
        require(items[itemId].listed, "Item is not listed");
        _;
    }
    function listItem(uint price) external {
        items[itemCount] = Item(payable(msg.sender), price, address(0), true);
        emit ItemListed(msg.sender, itemCount, price);
        itemCount++;
    }
    function buyItem(uint itemId) external payable exists(itemId) isListed(itemId) {
        Item storage item = items[itemId];
        require(msg.value >= item.price, "Insufficient funds to purchase item");
        require(msg.sender != item.seller, "Seller cannot buy their own item");
        item.seller.transfer(item.price);
        item.owner = msg.sender;
        item.listed = false;
        emit ItemPurchased(msg.sender, itemId, item.price);
    }
    function delistItem(uint itemId) external onlySeller(itemId) exists(itemId) isListed(itemId) {
        items[itemId].listed = false;
    }
    function relistItem(uint itemId, uint newPrice) external onlySeller(itemId) exists(itemId) {
        require(!items[itemId].listed, "Item is already listed");
        items[itemId].price = newPrice;
        items[itemId].listed = true;
        emit ItemListed(msg.sender, itemId, newPrice);
    }
}
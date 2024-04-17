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

    error NotSeller();
    error ItemDoesNotExist();
    error ItemNotListed();
    error InsufficientFunds();
    error SellerCannotBuy();
    error ItemAlreadyListed();

    modifier onlySeller(uint itemId) {
        if (msg.sender != items[itemId].seller) revert NotSeller();
        _;
    }

    modifier exists(uint itemId) {
        if (itemId >= itemCount) revert ItemDoesNotExist();
        _;
    }

    modifier isListed(uint itemId) {
        if (!items[itemId].listed) revert ItemNotListed();
        _;
    }

    function listItem(uint price) external {
        items[itemCount] = Item(payable(msg.sender), price, address(0), true);
        emit ItemListed(msg.sender, itemCount, price);
        itemCount++;
    }

    function buyItem(uint itemId) external payable exists(itemId) isListed(itemId) {
        Item storage item = items[itemId];

        if (msg.value < item.price) revert InsufficientFunds();
        if (msg.sender == item.seller) revert SellerCannotBuy();

        item.seller.transfer(item.price);
        item.owner = msg.sender;
        item.listed = false;

        emit ItemPurchased(msg.sender, itemId, item.price);
    }

    function delistItem(uint itemId) external onlySeller(itemId) exists(itemId) isListed(itemId) {
        items[itemId].listed = false;
    }

    function relistItem(uint itemId, uint newPrice) external onlySeller(itemId) exists(itemId) {
        if (items[itemId].listed) revert ItemAlreadyListed();

        items[itemId].price = newPrice;
        items[itemId].listed = true;
        emit ItemListed(msg.sender, itemId, newPrice);
    }
}
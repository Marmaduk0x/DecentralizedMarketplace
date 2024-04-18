pragma solidity ^0.8.0;

contract DecentralizedMarketplace {
    event ItemListed(address indexed seller, uint itemId, uint price);
    event ItemPurchased(address indexed buyer, uint itemId, uint purchasePrice);

    struct Item {
        address payable sellerAddress;
        uint listingPrice;
        address ownerAddress;
        bool isCurrentlyListed;
    }

    mapping(uint => Item) public listedItems;
    uint public totalListedItems;

    error UnauthorizedSeller();
    error ItemNotFound();
    error ItemUnlisted();
    error PaymentNotSufficient();
    error SellerCannotPurchase();
    error ItemAlreadyOnSale();

    modifier onlyItemSeller(uint itemId) {
        if (msg.sender != listedItems[itemId].sellerAddress) revert UnauthorizedSeller();
        _;
    }

    modifier itemExists(uint itemId) {
        if (itemId >= totalListedItems) revert ItemNotFound();
        _;
    }

    modifier isItemListed(uint itemId) {
        if (!listedItems[itemId].isCurrentlyListed) revert ItemUnlisted();
        _;
    }

    function listItem(uint price) external {
        listedItems[totalListedItems] = Item(payable(msg.sender), price, address(0), true);
        emit ItemListed(msg.sender, totalListedItems, price);
        totalListedItems++;
    }

    function purchaseItem(uint itemId) external payable itemExists(itemId) isItemListed(itemId) {
        Item storage item = listedItems[itemId];

        if (msg.value < item.listingPrice) revert PaymentNotSufficient();
        if (msg.sender == item.sellerAddress) revert SellerCannotPurchase();

        item.sellerAddress.transfer(item.listingPrice);
        item.ownerAddress = msg.sender;
        item.isCurrentlyListed = false;

        emit ItemPurchased(msg.sender, itemId, item.listingPrice);
    }

    function removeListing(uint itemId) external onlyItemSeller(itemId) itemExists(itemId) isItemListed(itemId) {
        listedItems[itemId].isCurrentlyListed = false;
    }

    function relistItem(uint itemId, uint newPrice) external onlyItemSeller(itemId) itemExists(itemId) {
        if (listedItems[itemId].isCurrentlyListed) revert ItemAlreadyOnSale();

        listedItems[itemId].listingPrice = newPrice;
        listedItems[itemId].isCurrentlyListed = true;
        emit ItemListed(msg.sender, itemId, newPrice);
    }
}
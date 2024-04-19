pragma solidity ^0.8.0;

contract DecentralizedMarketplace {
    event ProductListed(address indexed seller, uint productId, uint listingPrice);
    event ProductPurchased(address indexed buyer, uint productId, uint salePrice);

    struct Product {
        address payable seller;
        uint price;
        address buyer;
        bool listed;
    }

    mapping(uint => Product) public catalog;
    uint public itemCount;

    error NotSeller();
    error ProductDoesNotExist();
    error NotForSale();
    error InsufficientPayment();
    error BuyerIsSeller();
    error AlreadyListed();

    modifier onlySeller(uint productId) {
        if (msg.sender != catalog[productId].seller) revert NotSeller();
        _;
    }

    modifier productMustExist(uint productId) {
        if (productId >= itemCount) revert ProductDoesNotExist();
        _;
    }

    modifier isForSale(uint productId) {
        if (!catalog[productId].listed) revert NotForSale();
        _;
    }

    function listProduct(uint price) external {
        catalog[itemCount] = Product(payable(msg.sender), price, address(0), true);
        emit ProductListed(msg.sender, itemCount, price);
        itemCount++;
    }

    function buyProduct(uint productId) external payable productMustExist(productId) isForSale(productId) {
        Product storage product = catalog[productId];

        if (msg.value < product.price) revert InsufficientPayment();
        if (msg.sender == product.seller) revert BuyerIsSeller();

        product.seller.transfer(product.price);
        product.buyer = msg.sender;
        product.listed = false;

        emit ProductPurchased(msg.sender, productId, product.price);
    }

    function delistProduct(uint productId) external onlySeller(productId) productMustExist(productId) isForSale(productId) {
        catalog[productId].listed = false;
    }

    function relistProduct(uint productId, uint newPrice) external onlySeller(productId) productMustExist(productId) {
        if (catalog[productId].listed) revert AlreadyListed();

        catalog[productId].price = newPrice;
        catalog[productId].listed = true;
        emit ProductListed(msg.sender, productId, newPrice);
    }
}
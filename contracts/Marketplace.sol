// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Decentralized Marketplace
 * @dev Implementation of a marketplace smart contract
 */
contract DecentralizedMarketplace {
    // State variables
    uint public itemCount;

    // Structs
    struct Product {
        address payable seller;
        uint price;
        address buyer;
        bool listed;
    }

    // Mappings
    mapping(uint => Product) public catalog;

    // Events
    event ProductListed(address indexed seller, uint productId, uint listingPrice);
    event ProductPurchased(address indexed buyer, uint productId, uint salePrice);

    // Errors
    error NotSeller();
    error ProductDoesNotExist();
    error NotForSale();
    error InsufficientPayment();
    error BuyerIsSeller();
    error AlreadyListed();

    // Modifiers
    modifier onlySeller(uint productId) {
        Product storage product = catalog[productId];
        if (msg.sender != product.seller) revert NotSeller();
        _;
    }

    modifier productMustExist(uint productId) {
        // Since we're only increasing itemCount with each new product,
        // checking productId < itemCount ensures the product must exist if true.
        if (productId >= itemCount) revert ProductDoesNotExist();
        _;
    }

    modifier isForSale(uint productId) {
        if (!catalog[productId].listed) revert NotForSale();
        _;
    }

    /**
    * @dev List a new product on the marketplace
    * @param price Price of the product to list
    */
    function listProduct(uint price) external {
        catalog[itemCount] = Product(payable(msg.sender), price, address(0), true);
        emit ProductListed(msg.sender, itemCount, price);
        itemCount++;
    }

    /**
    * @dev Purchase a listed product
    * @param productId The ID of the product to purchase
    */
    function buyProduct(uint productId) external payable productMustExist(productId) isForSale(productId) {
        Product storage product = catalog[productId];

        if (msg.value < product.price) revert InsufficientPayment();
        if (msg.sender == product.seller) revert BuyerIsSeller();

        // Transfer first to reduce risk of re-entrancy attacks
        product.seller.transfer(product.price);
        
        // Update state after effect
        product.buyer = msg.sender;
        product.listed = false;

        emit ProductPurchased(msg.sender, productId, product.price);
    }

    /**
    * @dev Delist a product from sale
    * @param productId The ID of the product to delist
    */
    function delistProduct(uint productId) external onlySeller(productId) productMustExist(productId) isForSale(productId) {
        catalog[productId].listed = false;
    }

    /**
    * @dev Relist a product with a new price
    * @param productId The ID of the product to relist
    * @param newPrice The new price of the product
    */
    function relistProduct(uint productId, uint newPrice) external onlySeller(productId) productMustExist(productId) {
        if (catalog[productId].listed) revert AlreadyListed();

        catalog[productId].price = newPrice;
        catalog[productId].listed = true;
        emit ProductListed(msg.sender, productId, newPrice);
    }
}
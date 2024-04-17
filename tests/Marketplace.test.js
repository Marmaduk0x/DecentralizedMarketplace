const MarketplaceContract = artifacts.require("./Marketplace.sol");
require('dotenv').config();

contract('Marketplace', (accounts) => {
    let marketplaceInstance;
    const itemPriceInWei = web3.utils.toWei('1', 'Ether');
    const accountSeller = accounts[1];
    const accountBuyer = accounts[2];
    const invalidItemId = 99999;

    before(async () => {
        marketplaceInstance = await MarketplaceContract.deployed();
    });

    it('enables listing of a new item by a seller', async () => {
        const transactionReceipt = await marketplaceInstance.createProduct('iPhone X', itemPriceInWei, { from: accountSeller });
        assert.equal(transactionReceipt.logs.length, 1, 'triggers one event');
        const logEvent = transactionReceipt.logs[0].args;
        assert.equal(logEvent.id.toNumber(), 1, 'id is correct');
        assert.equal(logEvent.name, 'iPhone X', 'name is correct');
        assert.equal(logEvent.price.toString(), itemPriceInWei, 'price is correct');
        assert.equal(logEvent.owner, accountSeller, 'seller account is correct');
        assert.equal(logEvent.purchased, false, 'purchased status is correct');
    });

    it('facilitates the successful purchase of an item by a buyer', async () => {
        const sellerBalanceBeforeSale = await web3.eth.getBalance(accountSeller);
        const transactionReceipt = await marketplaceInstance.purchaseProduct(1, { from: accountBuyer, value: itemPriceInWei });
        const logEvent = transactionReceipt.logs[0].args;
        assert.equal(logEvent.id.toNumber(), 1, 'id is correct');
        assert.equal(logEvent.purchased, true, 'purchased status is correct');
        const sellerBalanceAfterSale = await web3.eth.getBalance(accountSeller);
        const priceBN = web3.utils.toBN(itemPriceInWei);
        const expectedSellerBalanceAfterSale = web3.utils.toBN(sellerBalanceBeforeSale).add(priceBN);
        assert.equal(sellerBalanceAfterSale.toString(), expectedSellerBalanceAfterSale.toString(), 'seller received correct funds');
    });

    it('blocks the purchase of an item that does not exist', async () => {
        try {
            await marketplaceInstance.purchaseProduct(invalidItemId, { from: accountBuyer, value: itemPriceInWei });
            assert.fail('Expected transaction to fail for non-existent item');
        } catch (error) {
            assert.include(error.message, 'revert', 'expected error message to contain "revert"');
        }
    });

    it('prevents purchase of an item with insufficient payment', async () => {
        try {
            const insufficientPayment = web3.utils.toWei('0.5', 'Ether');
            await marketplaceInstance.purchaseProduct(1, { from: accountBuyer, value: insufficientPayment });
            assert.fail('Expected transaction to fail for insufficient payment');
        } catch (error) {
            assert.include(error.message, 'revert', 'expected error message to contain "revert"');
        }
    });
});
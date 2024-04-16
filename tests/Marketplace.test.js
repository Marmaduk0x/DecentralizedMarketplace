const Marketplace = artifacts.require("./Marketplace.sol");
require('dotenv').config(); 

contract('Marketplace', (accounts) => {
    let marketplace;
    const productPrice = web3.utils.toWei('1', 'Ether');
    const seller = accounts[1];
    const buyer = accounts[2];
    const nonExistentItemId = 99999;

    before(async () => {
        marketplace = await Marketplace.deployed();
    });

    it('allows a user to list an item successfully', async () => {
        const receipt = await marketplace.createProduct('iPhone X', productPrice, { from: seller });
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        const event = receipt.logs[0].args;
        assert.equal(event.id.toNumber(), 1, 'id is correct');
        assert.equal(event.name, 'iPhone X', 'name is correct');
        assert.equal(event.price.toString(), productPrice, 'price is correct');
        assert.equal(event.owner, seller, 'seller is correct');
        assert.equal(event.purchased, false, 'purchased boolean is correct');
    });

    it('allows a user to purchase an item successfully', async () => {
        const oldSellerBalance = await web3.eth.getBalance(seller);
        const receipt = await marketplace.purchaseProduct(1, { from: buyer, value: productPrice });
        const event = receipt.logs[0].args;
        assert.equal(event.id.toNumber(), 1, 'id is correct');
        assert.equal(event.purchased, true, 'purchased status is correct');
        const newSellerBalance = await web3.eth.getBalance(seller);
        const price = web3.utils.toBN(productPrice);
        const expectedBalance = web3.utils.toBN(oldSellerBalance).add(price);
        assert.equal(newSellerBalance.toString(), expectedBalance.toString(), 'seller received funds');
    });

    it('prevents a user from buying a non-existent item', async () => {
        try {
            await marketplace.purchaseProduct(nonExistentItemId, { from: buyer, value: productPrice });
            assert.fail('The purchase transaction should not have succeeded');
        } catch (err) {
            assert.include(err.message, 'revert', 'Error message should contain "revert"');
        }
    });

    it('prevents a user from buying an item with insufficient funds', async () => {
        try {
            const insufficientAmount = web3.utils.toWei('0.5', 'Ether');
            await marketplace.purchaseProduct(1, { from: buyer, value: insufficientAmount });
            assert.fail('The purchase transaction should not have succeeded');
        } catch (err) {
            assert.include(err.message, 'revert', 'Error message should contain "revert"');
        }
    });
});
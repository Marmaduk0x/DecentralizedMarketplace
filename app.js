require('dotenv').config();
const Web3 = require('web3');
const MarketplaceABI = require('./MarketplaceABI.json');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_ENDPOINT));
const marketplaceContract = new web3.eth.Contract(MarketplaceABI, process.env.MARKETPLACE_CONTRACT_ADDRESS);

async function listItem(itemPrice, itemId) {
  try {
    const accounts = await web3.eth.getAccounts();
    await marketplaceContract.methods.listItem(itemPrice, itemId)
      .send({ from: accounts[0] })
      .on('transactionHash', function(hash){
        console.log(`Transaction hash for listing item: ${hash}`);
      })
      .on('receipt', function(receipt){
        console.log(`Receipt received: ${receipt}`);
      })
      .on('error', function(error, receipt) {
        console.error("Transaction error, transaction receipt might be available: ", receipt);
        throw new Error(error);
      });
    console.log("Item listed successfully");
  } catch (error) {
    console.error("Error listing item: ", error.message);
  }
}

async function buyItem(itemId, itemPrice) {
  try {
    const accounts = await web3.eth.getAccounts();
    await marketplaceContract.methods.buyItem(itemId)
      .send({ from: accounts[0], value: itemPrice })
      .on('error', console.error); // Simplified for brevity, add transactionHash and receipt handlers as needed
    console.log("Item bought successfully");
  } catch (error) {
    console.error("Error buying item: ", error.message);
    throw error; // Re-throw after logging if you want to handle it further up.
  }
}

async function displayItems() {
  try {
    const items = await marketplaceContract.methods.getItemsForSale().call();
    console.log("Items for sale: ", items);
  } catch (error) {
    console.error("Error fetching items for sale: ", error.message);
  }
}

async function cancelListing(itemId) {
  try {
    const accounts = await web3.eth.getAccounts();
    await marketplaceContract.methods.cancelItem(itemId)
      .send({ from: accounts[0] })
      .on('error', console.error); // Simplified for brevity, add transactionHash and receipt handlers as needed
    console.log("Listing cancelled successfully for item: ", itemId);
  } catch (error) {
    console.error("Error cancelling listing: ", error.message);
  }
}

async function updateItemPrice(itemId, newItemPrice) {
  try {
    const accounts = await web3.eth.getAccounts();
    await marketplaceContract.methods.updateItemPrice(itemId, newItemPrice)
      .send({ from: accounts[0] })
      .on('error', console.error);
    console.log("Item price updated successfully for item: ", itemId);
  } catch (error) {
    console.error("Error updating item price: ", error.message);
  }
}

(async () => {
  try {
    await listItem(web3.utils.toWei('0.1', 'ether'), 1);
    await updateItemPrice(1, web3.utils.toWei('0.2', 'ether'));
    await buyItem(1, web3.utils.toWei('0.2', 'ether'));
    await displayItems();
    await cancelListing(1);
  } catch (error) {
    console.error("Error in managing marketplace items: ", error.message);
  }
})();
require('dotenv').config();
const Web3 = require('web3');
const MarketplaceABI = require('./MarketplaceABI.json');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_ENDPOINT));
const marketplaceContract = new web3.eth.Contract(MarketplaceABI, process.env.MARKETPLACE_CONTRACT_ADDRESS);

async function listItem(itemPrice, itemId) {
  try {
    const accounts = await web3.eth.getAccounts();
    await marketplaceContract.methods.listItem(itemPrice, itemId)
      .send({ from: accounts[0] });
    console.log("Item listed successfully");
  } catch (error) {
    console.error("Error listing item: ", error.message);
  }
}

async function buyItem(itemId, itemPrice) {
  try {
    const accounts = await web3.eth.getAccounts();
    await marketplaceContract.methods.buyItem(itemId)
      .send({ from: accounts[0], value: itemPrice });
    console.log("Item bought successfully");
  } catch (error) {
    console.error("Error buying item: ", error.message);
  }
}

async function displayItems() {
  try {
    const items = await marketplaceContract.methods.getItemsForSale().call();
    console.log("Items for sale: ", items);
  } catch (error) {
    console.error("Error fetching items: ", error.message);
  }
}

async function cancelListing(itemId) {
  try {
    const accounts = await web3.eth.getAccounts();
    await marketplaceContract.methods.cancelItem(itemId)
      .send({ from: accounts[0] });
    console.log("Listing cancelled successfully for item: ", itemId);
  } catch (error) {
    console.error("Error cancelling listing: ", error.message);
  }
}

// New function to update the price of an already listed item
async function updateItemPrice(itemId, newItemPrice) {
  try {
    const accounts = await web3.eth.getAccounts();
    await marketplaceContract.methods.updateItemPrice(itemId, newItemPrice)
      .send({ from: accounts[0] });
    console.log("Item price updated successfully for item: ", itemId);
  } catch (error) {
    console.error("Error updating item price: ", error.message);
  }
}

(async () => {
  await listItem(web3.utils.toWei('0.1', 'ether'), 1);
  // Update item price, assuming the item ID 1 and new price to be 0.2 Ether
  await updateItemPrice(1, web3.utils.toWei('0.2', 'ether'));
  await buyItem(1, web3.utils.toWei('0.2', 'ether'));
  await displayItems();
  await cancelListing(1);
})();
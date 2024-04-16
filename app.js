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

(async () => {
  await listItem(web3.utils.toWei('0.1', 'ether'), 1);
  await buyItem(1, web3.utils.toWei('0.1', 'ether'));
  await displayItems();
})();
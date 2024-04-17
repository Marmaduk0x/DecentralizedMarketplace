const Marketplace = artifacts.require("Marketplace");
require('dotenv').config();

module.exports = async function(deployer, network, accounts) {
  let provider, account;

  if (network === 'development') {
    deployer.deploy(Marketplace);
  } else if (network === 'production') {
    provider = process.env.PRODUCTION_PROVIDER;
    account = process.env.PRODUCTION_ACCOUNT || accounts[0]; // Fallback to the first account if not specified

    await deployer.deploy(Marketplace, {from: account})
      .then(() => {
        if (process.env.INITIAL_FUNDING && process.env.INITIAL_FUNDING > 0) {
          // Assuming Marketplace contract has a payable fallback function or a specific payable function to accept funds
          return web3.eth.sendTransaction({
            from: account,
            to: Marketplace.address,
            value: web3.utils.toWei(process.env.INITIAL_FUNDING, "ether"),
          });
        }
      })
  } else {
    console.log("Please check your Truffle configuration for the network settings.");
  }
};
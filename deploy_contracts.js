const Marketplace = artifacts.require("Marketplace");
require('dotenv').config();

module.exports = async function(deployer, network, accounts) {
  let provider, account;
  console.log(`Deploying to ${network} network.`);

  if (network === 'development') {
    console.log("Deploying the contract to the development network...");
    deployer.deploy(Marketplace).then(() => {
      console.log("Marketplace deployed to the development network.");
    });
  } else if (network === 'production') {
    provider = process.env.PRODUCTION_PROVIDER; 
    account = process.env.PRODUCTION_ACCOUNT || accounts[0];

    console.log("Deploying the contract to the production network...");
    await deployer.deploy(Marketplace, {from: account})
      .then(() => {
        console.log("Marketplace deployed to the production network.");
        if (process.env.INITIAL_FUNDING && process.env.INITIAL_FUNDING > 0) {
          console.log("Sending initial funding to the Marketplace contract...");
          return web3.eth.sendTransaction({
            from: account,
            to: Marketplace.address,
            value: web3.utils.toWei(process.env.INITIAL_FUNDING, "ether"),
          })
          .then(() => {
            console.log(`${process.env.INITIAL_FUNDING} ether sent to the Marketplace contract.`);
          });
        }
      })
  } else {
    console.log("Unsupported network configuration. Please check your Truffle configuration for the network settings.");
  }
};
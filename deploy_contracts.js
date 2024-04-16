const Marketplace = artifacts.require("Marketplace");
require('dotenv').config();

module.exports = async function(deployer, network) {
  let provider, account;

  if(network === 'development') {
    deployer.deploy(Marketplace);
  } else if(network === 'production') {
    provider = process.env.PRODUCTION_PROVIDER;
    account = process.env.PRODUCTION_ACCOUNT;

    deployer.deploy(Marketplace, {from: account});
  } else {
    console.log("Please check your Truffle configuration for the network settings.");
  }
};
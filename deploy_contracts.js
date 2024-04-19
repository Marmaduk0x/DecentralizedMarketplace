const Marketplace = artifacts.require("Marketplace");
require('dotenv').config();

module.exports = async (deployer, network, accounts) => {
  console.log(`Deploying to ${network} network.`);

  switch (network) {
    case 'development':
      console.log("Deploying the contract to the development network...");
      await deployer.deploy(Marketplace);
      console.log("Marketplace deployed to the development network.");
      break;

    case 'production':
      const provider = process.env.PRODUCTION_PROVIDER;
      const account = process.env.PRODUCTION_ACCOUNT || accounts[0];
      
      console.log("Deploying the contract to the production network...");
      await deployer.deploy(Marketplace, {from: account});
      console.log("Marketplace deployed to the production network.");

      if (process.env.INITIAL_FUNDING && parseFloat(process.env.INITIAL_FUNDING) > 0) {
        console.log("Sending initial funding to the Marketplace contract...");
        await sendInitialFunding(process.env.INITIAL_FUNDING, account);
      }
      break;

    default:
      console.log("Unsupported network configuration. Please check your Truffle configuration for the network settings.");
  }
};

async function sendInitialFunding(fundingAmount, account) {
  try {
    await web3.eth.sendTransaction({
      from: account,
      to: Marketplace.address,
      value: web3.utils.toWei(fundingAmount, "ether"),
    });
    console.log(`${fundingAmount} ether sent to the Marketplace contract.`);
  } catch (error) {
    console.error("Failed to send initial funding. Error:", error);
  }
}
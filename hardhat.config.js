require("@nomiclabs/hardhat-ethers");

require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    opbnb: {
      url: "https://opbnb-mainnet-rpc.bnbchain.org",
      accounts: [process.env.PRIVATE_KEY],
    },
    opbnb_testnet: {
      url: "https://opbnb-testnet-rpc.bnbchain.org",
      accounts: [
        process.env.TESTNET_PRIVATE_KEY,
        process.env.TESTER1_TESTNET_PRIVATE_KEY,
        process.env.TESTER2_TESTNET_PRIVATE_KEY,
      ],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

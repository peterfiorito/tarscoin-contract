import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";

require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
  networks: {
    "base-mainnet": {
      url: "https://mainnet.base.org",
      accounts: [process.env.WALLET_KEY as string],
      gasPrice: 1000000000,
    },
    "base-goerli": {
      url: "https://goerli.base.org",
      accounts: [process.env.WALLET_KEY as string],
      gasPrice: 1000000000,
    },
    "base-local": {
      url: "http://localhost:8545",
      accounts: [process.env.WALLET_KEY as string],
      gasPrice: 1000000000,
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      }
    },
  },
};

export default config;

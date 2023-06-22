import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const PK =
  process.env.PK ||
  "0c6311ef37a396fe79a779fc307a4aa014c8fec29990acce6e52bd21710db846"; // well known private key
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.1",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545",
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PK],
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [PK],
    },
    bsc: {
      url: "https://data-seed-prebsc-1-s3.binance.org:8545",
      accounts: [PK],
    },
    bsc_main: {
      url: "https://bsc-dataseed.binance.org",
      accounts: [PK],
    },
    eth_main: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${INFURA_API_KEY}`,
      accounts: [PK],
    },
    arbitrumOne: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: [PK],
    },
    coverage: {
      url: "http://127.0.0.1:8555",
    },
  },
  mocha: {
    timeout: 100000000,
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.API_KEY || "",
    },
  },
};

export default config;

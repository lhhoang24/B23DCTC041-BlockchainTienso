require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// Private key lay tu file .env (KHONG hard-code, KHONG commit len GitHub)
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const SEPOLIA_URL =
  process.env.SEPOLIA_URL || "https://sepolia.gateway.tenderly.co";

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();
  for (const account of accounts) console.log(account.address);
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      chainId: 11155111,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};

// Deploy DominionDAO len Sepolia.
// Sau khi deploy se tu dong: (1) copy ABI sang web3-app/src/abis, (2) ghi dia chi contract vao web3-app/.env
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const DominionDAO = await hre.ethers.getContractFactory("DominionDAO");
  const dominionDAO = await DominionDAO.deploy();
  await dominionDAO.deployed();

  const address = dominionDAO.address;
  console.log("DominionDAO deployed to:", address);

  const webApp = path.join(__dirname, "..", "..", "web3-app");
  if (fs.existsSync(webApp)) {
    const artifact = path.join(
      __dirname, "..", "artifacts", "contracts", "DominionDAO.sol", "DominionDAO.json"
    );
    fs.mkdirSync(path.join(webApp, "src", "abis"), { recursive: true });
    fs.copyFileSync(artifact, path.join(webApp, "src", "abis", "DominionDAO.json"));
    fs.writeFileSync(path.join(webApp, ".env"), `REACT_APP_CONTRACT_ADDRESS=${address}\n`);
    console.log("Da copy ABI va ghi .env cho web3-app");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

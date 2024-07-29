const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const SonicAI = await hre.ethers.getContractFactory("SonicAI");
  const ownerPrivateKey = process.env.TESTNET_PRIVATE_KEY;

  if (!ownerPrivateKey) {
    throw new Error(
      "Owner private key is not set in the environment variables."
    );
  }

  const ownerWallet = new hre.ethers.Wallet(
    ownerPrivateKey,
    hre.ethers.provider
  );
  const ownerAddress = ownerWallet.address;

  console.log("Deploying SonicAI contract...");
  const sonicAI = await SonicAI.deploy(ownerAddress);

  await sonicAI.deployed();

  console.log("SonicAI deployed to:", sonicAI.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });

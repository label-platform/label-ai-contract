const hre = require("hardhat");

async function main() {
  const LuckyDraw = await hre.ethers.getContractFactory("LuckyDraw");
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
  const luckyDraw = await LuckyDraw.deploy(ownerAddress);

  await luckyDraw.deployed();

  console.log("LuckyDraw deployed to:", luckyDraw.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

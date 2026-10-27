const fs = require("fs");
const path = require("path");
const { ethers, artifacts, network } = require("hardhat");

async function main() {
  const initialSupply = ethers.parseUnits("1000000", 18);

  const PulseToken = await ethers.getContractFactory("PulseToken");
  const token = await PulseToken.deploy(initialSupply);
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log(`PulseToken deployed to ${address} on network "${network.name}"`);

  const artifact = await artifacts.readArtifact("PulseToken");
  const deployment = {
    address,
    chainId: Number(network.config.chainId),
    rpcUrl: network.config.url || "http://127.0.0.1:8545",
    abi: artifact.abi,
  };

  const outFile = path.join(__dirname, "..", "frontend", "src", "deployment.json");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));
  console.log(`Wrote deployment metadata to ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

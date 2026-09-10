const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PulseToken", function () {
  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 18);

  async function deploy() {
    const [owner, alice, bob] = await ethers.getSigners();
    const PulseToken = await ethers.getContractFactory("PulseToken");
    const token = await PulseToken.deploy(INITIAL_SUPPLY);
    await token.waitForDeployment();
    return { token, owner, alice, bob };
  }

  it("sets name, symbol and initial supply", async function () {
    const { token, owner } = await deploy();
    expect(await token.name()).to.equal("Open PulseChain Token");
    expect(await token.symbol()).to.equal("OPLS");
    expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
    expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
  });

  it("transfers tokens between accounts", async function () {
    const { token, owner, alice } = await deploy();
    const amount = ethers.parseUnits("250", 18);
    await expect(token.transfer(alice.address, amount)).to.changeTokenBalances(
      token,
      [owner, alice],
      [-amount, amount]
    );
  });

  it("allows the owner to mint and rejects non-owners", async function () {
    const { token, owner, alice } = await deploy();
    const amount = ethers.parseUnits("500", 18);

    await token.mint(alice.address, amount);
    expect(await token.balanceOf(alice.address)).to.equal(amount);

    await expect(
      token.connect(alice).mint(alice.address, amount)
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });
});

const { ethers } = require("hardhat");

let SonicAI;
let sonicAI;
let owner;
let addr1;
let addr2;

before(async () => {
  const chai = await import("chai");
  const waffle = await import("ethereum-waffle");
  chai.use(waffle.solidity);
  global.expect = chai.expect;
});

describe("SonicAI", function () {
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    SonicAI = await ethers.getContractFactory("SonicAI");
    sonicAI = await SonicAI.deploy(owner.address);
    await sonicAI.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await sonicAI.owner()).to.equal(owner.address);
    });

    it("Should have the correct name and symbol", async function () {
      expect(await sonicAI.name()).to.equal("SonicAI");
      expect(await sonicAI.symbol()).to.equal("SA");
    });
  });

  describe("Minting", function () {
    it("Should allow the owner to mint a token", async function () {
      const songId = Math.floor(Math.random() * 1000000).toString();
      await sonicAI.safeMint(addr1.address, 1, songId);
      expect(await sonicAI.ownerOf(1)).to.equal(addr1.address);
      expect(await sonicAI.tokenURI(1)).to.equal(
        `https://prod-api.label-foundation.com/api/nft/song/${songId}`
      );
    });

    it("Should not allow non-owners to mint a token", async function () {
      await expect(
        sonicAI.connect(addr1).safeMint(addr2.address, 1, "1")
      ).to.be.revertedWith("OwnableUnauthorizedAccount");
    });
  });

  describe("Pausing", function () {
    it("Should allow the owner to pause and unpause the contract", async function () {
      await sonicAI.pause();
      expect(await sonicAI.paused()).to.be.true;

      await sonicAI.unpause();
      expect(await sonicAI.paused()).to.be.false;
    });

    it("Should not allow non-owners to pause or unpause", async function () {
      await expect(sonicAI.connect(addr1).pause()).to.be.revertedWith(
        "OwnableUnauthorizedAccount"
      );
      await expect(sonicAI.connect(addr1).unpause()).to.be.revertedWith(
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should not allow minting when paused", async function () {
      await sonicAI.pause();
      await expect(sonicAI.safeMint(addr1.address, 1, "1")).to.be.revertedWith(
        "EnforcedPause"
      );
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await sonicAI.safeMint(addr1.address, 1, "1");
    });

    it("Should allow the owner of a token to burn it", async function () {
      await sonicAI.connect(addr1).burn(1);
      await expect(sonicAI.ownerOf(1)).to.be.revertedWith(
        "ERC721NonexistentToken"
      );
    });

    it("Should not allow non-owners to burn a token", async function () {
      await expect(sonicAI.connect(addr2).burn(1)).to.be.revertedWith(
        "ERC721InsufficientApproval"
      );
    });
  });

  describe("Enumerable", function () {
    beforeEach(async function () {
      await sonicAI.safeMint(addr1.address, 1, "1");
      await sonicAI.safeMint(addr1.address, 2, "2");
      await sonicAI.safeMint(addr2.address, 3, "3");
    });

    it("Should correctly report total supply", async function () {
      expect(await sonicAI.totalSupply()).to.equal(3);
    });

    it("Should correctly report token by index", async function () {
      expect(await sonicAI.tokenByIndex(0)).to.equal(1);
      expect(await sonicAI.tokenByIndex(1)).to.equal(2);
      expect(await sonicAI.tokenByIndex(2)).to.equal(3);
    });

    it("Should correctly report token of owner by index", async function () {
      expect(await sonicAI.tokenOfOwnerByIndex(addr1.address, 0)).to.equal(1);
      expect(await sonicAI.tokenOfOwnerByIndex(addr1.address, 1)).to.equal(2);
      expect(await sonicAI.tokenOfOwnerByIndex(addr2.address, 0)).to.equal(3);
    });
  });
});

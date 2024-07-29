const { ethers } = require("hardhat");

let LuckyDraw;
let luckyDraw;
let owner;
let addr1;
let addr2;

before(async () => {
  const chai = await import("chai");
  const waffle = await import("ethereum-waffle");
  chai.use(waffle.solidity);
  global.expect = chai.expect;
});

describe("LuckyDraw", function () {
  beforeEach(async function () {
    LuckyDraw = await ethers.getContractFactory("LuckyDraw");
    [owner, addr1, addr2] = await ethers.getSigners();
    luckyDraw = await LuckyDraw.deploy(owner.address);
    await luckyDraw.deployed();
  });

  async function increaseTime(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
  }

  async function getCurrentTime() {
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    return blockBefore.timestamp;
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await luckyDraw.owner()).to.equal(owner.address);
    });
  });

  describe("Create Draw", function () {
    it("Should create a new draw", async function () {
      const currentTime = await getCurrentTime();
      const startTime = currentTime + 1000;
      const drawTime = startTime + 2000;
      await luckyDraw.createDraw(1, startTime, drawTime, 1);
      const draw = await luckyDraw.draws(1);
      expect(draw.id).to.equal(1);
      expect(draw.winnerCount).to.equal(1);
    });

    it("Should not allow creating a draw with existing id", async function () {
      const currentTime = await getCurrentTime();
      const startTime = currentTime + 1000;
      const drawTime = startTime + 2000;
      await luckyDraw.createDraw(2, startTime, drawTime, 1);
      await expect(
        luckyDraw.createDraw(2, startTime, drawTime, 1)
      ).to.be.revertedWith("Draw ID already exists.");
    });

    it("Should not allow creating a draw with invalid times", async function () {
      const currentTime = await getCurrentTime();
      const startTime = currentTime + 1000;
      await expect(
        luckyDraw.createDraw(3, startTime + 100, startTime, 1)
      ).to.be.revertedWith("Start time must be before draw time.");
    });
  });

  describe("Enter Draw", function () {
    let drawId;
    let startTime;
    let drawTime;

    beforeEach(async function () {
      drawId = Math.floor(Math.random() * 1000000);
      const currentTime = await getCurrentTime();
      startTime = currentTime + 1000;
      drawTime = startTime + 2000;
      await luckyDraw.createDraw(drawId, startTime, drawTime, 1);
    });

    it("Should allow a user to enter a draw", async function () {
      await increaseTime(1500);
      await luckyDraw.enterDraw(drawId, addr1.address);
      const draw = await luckyDraw.draws(drawId);
      expect(draw.participantCount).to.equal(1);
    });

    it("Should not allow a user to enter a draw more than max entries", async function () {
      await increaseTime(1500);
      await luckyDraw.enterDraw(drawId, addr1.address);
      await expect(
        luckyDraw.enterDraw(drawId, addr1.address)
      ).to.be.revertedWith("Entry limit exceeded for this user.");
    });

    it("Should not allow entering a non-existent draw", async function () {
      await increaseTime(1500);
      await expect(
        luckyDraw.enterDraw(999999, addr1.address)
      ).to.be.revertedWith("This draw does not exist.");
    });

    it("Should not allow entering a draw before it starts", async function () {
      await expect(
        luckyDraw.enterDraw(drawId, addr1.address)
      ).to.be.revertedWith("Draw has not started yet.");
    });

    it("Should not allow entering a draw after it ends", async function () {
      await increaseTime(3500);
      await expect(
        luckyDraw.enterDraw(drawId, addr1.address)
      ).to.be.revertedWith("Registration for this draw has closed.");
    });
  });

  describe("Draw Winners", function () {
    let drawId;
    let startTime;
    let drawTime;

    beforeEach(async function () {
      drawId = Math.floor(Math.random() * 1000000);
      const currentTime = await getCurrentTime();
      startTime = currentTime + 1000;
      drawTime = startTime + 2000;
      await luckyDraw.createDraw(drawId, startTime, drawTime, 1);
      await increaseTime(1500);
      await luckyDraw.enterDraw(drawId, addr1.address);
      await luckyDraw.enterDraw(drawId, addr2.address);
    });

    it("Should draw winners correctly", async function () {
      await increaseTime(2000);
      await luckyDraw.drawWinners(drawId);
      const winners = await luckyDraw.getWinners(drawId);
      expect(winners.length).to.equal(1);
    });

    it("Should not draw winners for a non-existent draw", async function () {
      await increaseTime(2000);
      await expect(luckyDraw.drawWinners(999999)).to.be.revertedWith(
        "This draw does not exist."
      );
    });

    it("Should not draw winners before draw time", async function () {
      await expect(luckyDraw.drawWinners(drawId)).to.be.revertedWith(
        "Draw time has not passed yet."
      );
    });

    it("Should not draw winners more than once", async function () {
      await increaseTime(2000);
      await luckyDraw.drawWinners(drawId);
      await expect(luckyDraw.drawWinners(drawId)).to.be.revertedWith(
        "Winners have already been drawn."
      );
    });
  });

  describe("Set Winners", function () {
    let drawId;
    let startTime;
    let drawTime;

    beforeEach(async function () {
      drawId = Math.floor(Math.random() * 1000000);
      const currentTime = await getCurrentTime();
      startTime = currentTime + 1000;
      drawTime = startTime + 2000;
      await luckyDraw.createDraw(drawId, startTime, drawTime, 1);
      await increaseTime(1500);
      await luckyDraw.enterDraw(drawId, addr1.address);
      await luckyDraw.enterDraw(drawId, addr2.address);
      await increaseTime(2000);
    });

    it("Should set winners correctly", async function () {
      await luckyDraw.setWinners(drawId, [addr1.address]);
      const winners = await luckyDraw.getWinners(drawId);
      expect(winners[0]).to.equal(addr1.address);
    });

    it("Should not set winners for a non-existent draw", async function () {
      await expect(
        luckyDraw.setWinners(999999, [addr1.address])
      ).to.be.revertedWith("This draw does not exist.");
    });

    it("Should not set winners before draw time", async function () {
      const newDrawId = drawId + 1;
      const currentTime = await getCurrentTime();
      const newStartTime = currentTime + 1000;
      const newDrawTime = newStartTime + 2000;
      await luckyDraw.createDraw(newDrawId, newStartTime, newDrawTime, 1);
      await expect(
        luckyDraw.setWinners(newDrawId, [addr1.address])
      ).to.be.revertedWith("Winners can only be set after the draw time.");
    });

    it("Should not set winners more than once", async function () {
      await luckyDraw.setWinners(drawId, [addr1.address]);
      await expect(
        luckyDraw.setWinners(drawId, [addr1.address])
      ).to.be.revertedWith("Winners have already been set for this draw.");
    });

    it("Should not set winners with count mismatch", async function () {
      await expect(
        luckyDraw.setWinners(drawId, [addr1.address, addr2.address])
      ).to.be.revertedWith("Winner count mismatch.");
    });
  });

  describe("Get Participants and Winners", function () {
    let drawId;
    let startTime;
    let drawTime;

    beforeEach(async function () {
      drawId = Math.floor(Math.random() * 1000000);
      const currentTime = await getCurrentTime();
      startTime = currentTime + 1000;
      drawTime = startTime + 2000;
      await luckyDraw.createDraw(drawId, startTime, drawTime, 1);
      await increaseTime(1500);
      await luckyDraw.enterDraw(drawId, addr1.address);
      await luckyDraw.enterDraw(drawId, addr2.address);
    });

    it("Should return correct participants", async function () {
      const participants = await luckyDraw.getParticipants(drawId);
      expect(participants.length).to.equal(2);

      // BigNumber를 16진수 문자열로 변환한 후 주소로 정규화
      const normalizedParticipants = participants.map((addr) =>
        ethers.utils.getAddress(
          "0x" + addr.toHexString().slice(2).padStart(40, "0")
        )
      );

      // 주소를 정규화하여 비교
      expect(normalizedParticipants).to.include(
        ethers.utils.getAddress(addr1.address)
      );
      expect(normalizedParticipants).to.include(
        ethers.utils.getAddress(addr2.address)
      );

      // 디버깅을 위한 로그 추가
      console.log("Participants:", normalizedParticipants);
      console.log("addr1:", ethers.utils.getAddress(addr1.address));
      console.log("addr2:", ethers.utils.getAddress(addr2.address));
    });

    it("Should return correct winners after drawing", async function () {
      await increaseTime(2000);
      await luckyDraw.drawWinners(drawId);
      const winners = await luckyDraw.getWinners(drawId);
      expect(winners.length).to.equal(1);
    });
  });
});

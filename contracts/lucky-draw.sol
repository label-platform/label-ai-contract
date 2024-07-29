// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./openzeppelin/access/Ownable.sol";


contract LuckyDraw is Ownable {
    struct Draw {
        uint256 id;
        uint256 startTime;
        uint256 drawTime;
        bool isDrawn;
        uint256 winnerCount;
        uint256 participantCount;
        bool winnersSet;
    }

    mapping(uint256 => Draw) public draws;
    mapping(uint256 => mapping(uint256 => uint256)) private userEntries; 
    mapping(uint256 => uint256[]) private winners;
    mapping(uint256 => mapping(uint256 => uint256)) private participantIndex;
    mapping(uint256 => mapping(uint256 => uint256)) private indexToParticipant;
    uint256 public maxEntries = 1;

    event DrawCreated(uint256 drawId, uint256 startTime, uint256 drawTime, uint256 winnerCount);
    event ParticipantEntered(uint256 drawId, uint256 userId, uint256 entryCount);
    event WinnersDrawn(uint256 drawId, uint256[] winners);

    constructor(address initialOwner) {
        transferOwnership(initialOwner);
    }

    function createDraw(uint256 drawId, uint256 _startTime, uint256 _drawTime, uint256 _winnerCount) public onlyOwner {
        require(draws[drawId].id == 0, "Draw ID already exists.");
        require(_startTime < _drawTime, "Start time must be before draw time.");
        require(_drawTime > block.timestamp, "Draw time must be in the future.");
        require(_winnerCount > 0, "There must be at least one winner.");

        draws[drawId] = Draw({
            id: drawId,
            startTime: _startTime,
            drawTime: _drawTime,
            isDrawn: false,
            winnerCount: _winnerCount,
            participantCount: 0,
            winnersSet: false
        });

        emit DrawCreated(drawId, _startTime, _drawTime, _winnerCount);
    }

    function enterDraw(uint256 drawId, uint256 userId) public {
        require(userId != 0, "Invalid user ID.");
        Draw storage draw = draws[drawId];
        require(draw.id != 0, "This draw does not exist.");
        require(!draw.isDrawn, "Draw has already been completed.");
        require(block.timestamp >= draw.startTime, "Draw has not started yet.");
        require(block.timestamp < draw.drawTime, "Registration for this draw has closed.");
        require(userEntries[drawId][userId] < maxEntries, "Entry limit exceeded for this user.");

        uint256 entryCount = userEntries[drawId][userId];
        if (entryCount == 0) {
            uint256 index = draw.participantCount++;
            participantIndex[drawId][userId] = index;
            indexToParticipant[drawId][index] = userId;
        }

        userEntries[drawId][userId] = entryCount + 1;

        emit ParticipantEntered(drawId, userId, entryCount + 1);
    }

    function drawWinners(uint256 drawId) public onlyOwner {
        require(draws[drawId].id != 0, "This draw does not exist.");
        require(draws[drawId].drawTime <= block.timestamp, "Draw time has not passed yet.");
        require(!draws[drawId].isDrawn, "Winners have already been drawn.");

        Draw storage draw = draws[drawId];
        draw.isDrawn = true;
        draw.winnersSet = true;

        uint256 winnersCount = draw.winnerCount;
        uint256 totalParticipantsNumber = draw.participantCount;

        for (uint256 i = 0; i < winnersCount; i++) {
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, i))) % (totalParticipantsNumber - i);
            winners[drawId].push(indexToParticipant[drawId][randomIndex]);
            indexToParticipant[drawId][randomIndex] = indexToParticipant[drawId][totalParticipantsNumber - i - 1];
        }

        emit WinnersDrawn(drawId, winners[drawId]);
    }

    function setWinners(uint256 drawId, uint256[] memory winnerIds) public onlyOwner {
        Draw storage draw = draws[drawId];
        require(draw.id != 0, "This draw does not exist.");
        require(block.timestamp >= draw.drawTime, "Winners can only be set after the draw time.");
        require(!draw.winnersSet, "Winners have already been set for this draw.");
        require(winnerIds.length == draw.winnerCount, "Winner count mismatch.");

        winners[drawId] = winnerIds;
        draw.isDrawn = true;
        draw.winnersSet = true;

        emit WinnersDrawn(drawId, winners[drawId]);
    }

    function setMaxEntries(uint256 newMaxEntries) public onlyOwner {
        maxEntries = newMaxEntries;
    }

    function getParticipants(uint256 drawId) public view returns (uint256[] memory) {
        require(draws[drawId].id != 0, "This draw does not exist.");

        uint256 participantCount = draws[drawId].participantCount;
        uint256[] memory participantList = new uint256[](participantCount);

        for (uint256 i = 0; i < participantCount; i++) {
            participantList[i] = indexToParticipant[drawId][i];
        }

        return participantList;
    }

    function getWinners(uint256 drawId) public view returns (uint256[] memory) {
        require(draws[drawId].id != 0, "This draw does not exist.");
        require(draws[drawId].isDrawn, "Winners have not been drawn yet.");
        return winners[drawId];
    }
}
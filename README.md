# LABEL AI Smart Contracts

Welcome to the LABEL AI Smart Contracts repository. This project implements blockchain-based LABEL AI projects.

## Overview

- **LuckyDraw**: A contract for managing lucky draw events with multiple participants and winners
- **SonicAI**: An ERC721 token with enumerable, URI storage, pausable, and burnable extensions

## Tech Stack

- Solidity
- Hardhat
- OpenZeppelin Contracts
- Ethers.js

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/label-ai-contracts.git
   cd label-ai-contracts
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up `.env` file:
   ```
   TESTNET_PRIVATE_KEY=your_private_key
   TESTER1_TESTNET_PRIVATE_KEY=tester1_private_key
   TESTER2_TESTNET_PRIVATE_KEY=tester2_private_key
   ```

## Usage

### Compile contracts

```
npx hardhat compile
```

### Run tests

```
npx hardhat test
```

### Deploy contracts

1. Choose a network (e.g., opbnb_testnet)
2. Run the deployment scripts:
   ```
   npx hardhat run scripts/deploy_lucky_draw.js --network opbnb_testnet
   npx hardhat run scripts/deploy_sonic_ai.js --network opbnb_testnet
   ```

## Contributing

1. Fork this repository.
2. Create a new branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request.

## License

This project is licensed under the MIT License.

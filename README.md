# ChronoChain

An implementation of a blockchain based on Bitcoin's blockchain, written in TypeScript using Express. This project simulates the fundamental concepts of a blockchain network, including mining, transactions, wallets, and communication via REST API.

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Execution](#execution)
  - [Compilation](#compilation)
  - [Starting the Blockchain Server](#starting-the-blockchain-server)
  - [Running the Miner](#running-the-miner)
  - [Using the Wallet](#using-the-wallet)
- [Testing](#testing)
- [Available Scripts](#available-scripts)
- [License](#license)

## Introduction

**ChronoChain** is a simplified blockchain that allows you to understand and experiment with the basic principles behind Bitcoin. The project was developed in TypeScript and includes tests written with Jest to ensure code quality.

## Prerequisites

Before starting, make sure you have the following tools installed on your machine:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/your-username/chronochain.git
cd chronochain
npm install
```

## Configuration

Create a .env file at the root of the project following the model of the .env.example file:
```
# Address of the blockchain server (e.g., "http://localhost:3000")
BLOCKCHAIN_SERVER=

# Port on which the blockchain server will run (e.g., 3000)
BLOCKCHAIN_PORT=

# Miner wallet address
MINER_WALLET=

# Blockchain owner wallet address
BLOCKCHAIN_WALLET=
```
Fill in the environment variables with the appropriate values.

## Execution

### Compilation
Compile the TypeScript project to JavaScript:
```
run npm build
```

### Starting the Blockchain Server
Start the blockchain server:
```
npm run blockchain
```

### Running the Miner

In a new terminal window, run the miner:
```
npm run miner
```

### Using the Wallet

In another terminal window, run the wallet client:
```
npm run wallet
```

## Testing

To run the tests written with Jest:
```
npm test
```

## Available Scripts

In the package.json file, the following scripts are available:

	•	npm start: Starts the main application.
	•	npm run build: Compiles the TypeScript code.
	•	npm run dev: Starts the application in development mode with nodemon.
	•	npm test: Runs the tests with Jest.
	•	npm run blockchain: Starts the blockchain server.
	•	npm run miner: Runs the miner client.
	•	npm run wallet: Runs the wallet client.

## License

This project is under the ISC license.

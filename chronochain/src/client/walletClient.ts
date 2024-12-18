import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import readline from "readline";
import Wallet from "../lib/wallet";
import Transaction from "../lib/transaction";
import TransactionType from "../lib/transactionType";
import TransactionInput from "../lib/transactionInput";
import TransactionOutput from "../lib/transactionOutput";

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

let myWalletPublicKey = "";
let myWalletPrivateKey = "";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

rl.on("close", () => {
  console.log("Interface closed");
  process.exit(0);
});

function menu() {
  setTimeout(() => {
    console.clear();

    if (myWalletPublicKey === "") {
      console.log("You are not connected to a wallet");
    } else {
      console.log(`Your Wallet: ${myWalletPublicKey}`);
    }

    console.log("1. Create a new wallet");
    console.log("2. Restore a wallet");
    console.log("3. Balance");
    console.log("4. Send transaction");
    console.log("5. Search transaction");
    console.log("6. Exit");
    rl.question("Select an option: ", (answer) => {
      switch (answer) {
        case "1":
          console.log("Creating a new wallet...");
          createWallet();
          break;
        case "2":
          console.log("Restoring a wallet...");
          restoreWallet();
          break;
        case "3":
          console.log("Checking balance...");
          getBalance();
          break;
        case "4":
          console.log("Sending transaction...");
          sendTransaction();
          break;
        case "5":
          searchTransaction();
          break;
        case "6":
          exit();
        default:
          console.log("Invalid option");
          menu();
      }
    });
  }, 1000);
}

function preMenu() {
  rl.question("Press any key to continue...", () => {
    menu();
  });
}

function createWallet() {
  console.clear();
  const wallet = new Wallet();
  myWalletPublicKey = wallet.publicKey;
  myWalletPrivateKey = wallet.privateKey;
  console.log(wallet);
  preMenu();
}

function restoreWallet() {
  console.clear();
  rl.question("Enter your private key or WIF:", (WIForPrivateKey) => {
    const wallet = new Wallet(WIForPrivateKey);
    myWalletPublicKey = wallet.publicKey;
    myWalletPrivateKey = wallet.privateKey;
    console.log("Wallet restored successfully");
    console.log(wallet);
    preMenu();
  });
}

async function getBalance() {
  console.clear();
  if (!myWalletPublicKey) {
    console.log("You need to connect to a wallet first");
    return preMenu();
  }

  const { data } = await axios.get(
    `${BLOCKCHAIN_SERVER}wallets/${myWalletPublicKey}`
  );
  console.log(`Balance: ${data.balance}`);
  preMenu();
}

function sendTransaction() {
  console.clear();
  if (!myWalletPublicKey) {
    console.log("You need to connect to a wallet first");
    return preMenu();
  }

  console.log(`Your Wallet: ${myWalletPublicKey}`);
  rl.question("Enter the recipient's public key: ", (recipientPublicKey) => {
    console.log(recipientPublicKey);
    if (recipientPublicKey.length < 66) {
      return preMenu();
    }

    rl.question("Enter the amount to send: ", async (amountStr) => {
      const amount = parseInt(amountStr);
      if (!amount) {
        console.log("Invalid amount");
        return preMenu();
      }

      const walletResponse = await axios.get(
        `${BLOCKCHAIN_SERVER}wallets/${myWalletPublicKey}`
      );
      const balance = walletResponse.data.balance as number;
      const fee = walletResponse.data.fee as number;
      const utxo = walletResponse.data.utxo as TransactionOutput[];

      if (balance < amount + fee) {
        console.log("Insufficient funds");
        return preMenu();
      }

      const txInputs = utxo.map((txo) => TransactionInput.fromTxo(txo));
      txInputs.forEach((txi, index, arr) =>
        arr[index].sign(myWalletPrivateKey)
      );

      // Create the transaction
      const txOutputs = [] as TransactionOutput[];
      txOutputs.push(
        new TransactionOutput({
          toAddress: recipientPublicKey,
          amount,
        } as TransactionOutput)
      );
      // Change output
      const remainingBalance = balance - amount - fee;
      if (remainingBalance > 0) {
        txOutputs.push(
          new TransactionOutput({
            toAddress: myWalletPublicKey,
            amount: remainingBalance,
          } as TransactionOutput)
        );
      }

      const tx = new Transaction({
        txInputs,
        txOutputs,
      } as Transaction);

      tx.hash = tx.getHash();
      tx.txOutputs.forEach((txo, index, arr) => (arr[index].tx = tx.hash));

      console.log(tx);
      console.log("Remaining balance: ", remainingBalance);

      try {
        const txResponde = await axios.post(
          `${BLOCKCHAIN_SERVER}transactions`,
          tx
        );
        console.log("Transaction sent successfully");
        console.log(txResponde.data.hash);
      } catch (error: any) {
        console.error(error.response ? error.response.data : error.message);
      }

      preMenu();
    });
  });

  preMenu();
}

function searchTransaction() {
  console.clear();
  rl.question("Enter the transaction hash: ", async (hash) => {
    const tx = await axios.get(`${BLOCKCHAIN_SERVER}transactions/${hash}`);
    console.log(tx.data);
    return preMenu();
  });
}

function exit() {
  console.log("Exiting...");
  process.exit(1000);
}

menu();

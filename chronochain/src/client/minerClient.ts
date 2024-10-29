import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import BlockInfo from "../lib/blockInfo";
import Block from "../lib/block";
import Wallet from "../lib/wallet";
import Transaction from "../lib/transaction";
import TransactionOutput from "../lib/transactionOutput";
import Blockchain from "../lib/blockchain";

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;
const minerWallet = new Wallet(process.env.MINER_WALLET);
let totalMined = 0;

function getRewardTx(
  blockInfo: BlockInfo,
  nextBlock: Block
): Transaction | undefined {
  let amount = 0;

  if (blockInfo.difficulty <= blockInfo.maxDifficulty)
    amount += Blockchain.getRewardAmout(blockInfo.difficulty);

  nextBlock.transactions.forEach((tx, index) => {
    console.log(`Transaction #${index}:`, tx);
    console.log("Is instance of Transaction:", tx instanceof Transaction);
  });
  const fee = nextBlock.transactions
    .map((tx) => tx.getFee())
    .reduce((a, b) => a + b);
  const feeCheck = nextBlock.transactions.length * blockInfo.feePerTx;
  if (fee < feeCheck) {
    console.log("Invalid fee amount");
    setTimeout(() => mine(), 5000);
    return;
  }

  amount += fee;

  const txo = new TransactionOutput({
    toAddress: minerWallet.publicKey,
    amount,
  } as TransactionOutput);

  return Transaction.fromReward(txo);
}

async function mine() {
  console.log("Getting next block info...");
  const { data } = await axios.get(`${BLOCKCHAIN_SERVER}blocks/next`);
  if (!data) {
    console.log("No transactions to mine. Waiting...");
    setTimeout(() => mine(), 5000);
    return;
  }

  const blockInfo = data as BlockInfo;
  const newBlock = Block.fromBlockInfo(blockInfo);

  const tx = getRewardTx(blockInfo, newBlock);
  if (!tx) return;

  newBlock.transactions.push(tx);

  newBlock.miner = minerWallet.publicKey;
  newBlock.hash = newBlock.getHash();

  console.log("Start mining block #", newBlock.index);
  newBlock.mine(blockInfo.difficulty, minerWallet.publicKey);

  console.log("Block mined! Sending to blockchain server...");
  try {
    await axios.post(`${BLOCKCHAIN_SERVER}blocks`, newBlock);
    console.log("Block added to blockchain!");
    totalMined++;
    console.log("Total blocks mined: ", totalMined);
  } catch (err: any) {
    console.error(err.response ? err.response.data : err.message);
  }

  setTimeout(() => mine(), 1000);
}

mine();

import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import BlockInfo from "../lib/blockInfo";
import Block from "../lib/block";
import Wallet from "../lib/wallet";
import Transaction from "../lib/transaction";
import TransactionType from "../lib/transactionType";

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;
const minerWallet = new Wallet(process.env.MINER_WALLET);
let totalMined = 0;

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

  newBlock.transactions.push(
    new Transaction({
      to: minerWallet.publicKey,
      type: TransactionType.FEE,
    } as Transaction)
  );
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

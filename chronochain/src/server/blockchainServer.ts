import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import Blockchain from "../lib/blockchain";
import Block from "../lib/block";
import Transaction from "../lib/transaction";

const app = express();
const PORT = parseInt((process.env.PORT as string) || "3000");

/* c8 ignore start */
if (process.argv.includes("--run")) app.use(morgan("tiny"));
/* c8 ignore end */

app.use(express.json());

const blockchain = new Blockchain();

app.get("/status", (req, res, next) => {
  res.json({
    numberOfBlocks: blockchain.blocks.length,
    lastBlock: blockchain.getLastBlock(),
    isValid: blockchain.isValid(),
  });
});

app.get("/blocks/next", (req, res, next) => {
  res.json(blockchain.getNextBlock());
});

app.get("/blocks/:indexOrHash", (req, res, next) => {
  let block;
  if (/^[0-9]+$/.test(req.params.indexOrHash)) {
    block = blockchain.blocks[parseInt(req.params.indexOrHash)];
  } else {
    block = blockchain.getBlock(req.params.indexOrHash);
  }

  if (!block) {
    res.sendStatus(404);
  } else {
    res.json(block);
  }
});

app.post("/blocks", (req, res, next) => {
  if (req.body.hash === undefined) {
    res.sendStatus(422);
  }

  const block = new Block(req.body as Block);
  const result = blockchain.addBlock(block);
  if (result.success) {
    res.status(201).json(block);
  } else {
    res.status(400).json(result);
  }
});

app.get("/transactions/:hash?", (req, res, next) => {
  if (req.params.hash) {
    res.json(blockchain.getTransaction(req.params.hash));
  } else
    res.json({
      next: blockchain.mempool.slice(0, Blockchain.TX_PER_BLOCK),
      total: blockchain.mempool.length,
    });
});

app.post("/transactions", (req, res, next) => {
  if (req.body.hash === undefined) {
    res.sendStatus(422);
  }

  const tx = new Transaction(req.body as Transaction);
  const validation = blockchain.addTransaction(tx);

  if (validation.success) {
    res.status(201).json(tx);
  } else {
    res.status(400).json(validation);
  }
});

/* c8 ignore start */
if (process.argv.includes("--run"))
  app.listen(PORT, () => {
    console.log(`Blockchain server is running on port ${PORT}`);
  });
/* c8 ignore end */

export { app };

import express from "express";
import morgan from "morgan";
import Blockchain from "../lib/blockchain";
import Block from "../lib/block";

const app = express();
const PORT = 3000;

if (process.argv.includes("--run")) app.use(morgan("tiny"));

app.use(express.json());

const blockchain = new Blockchain();

app.get("/status", (req, res, next) => {
  res.json({
    numberOfBlocks: blockchain.blocks.length,
    lastBlock: blockchain.getLastBlock(),
    isValid: blockchain.isValid(),
  });
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

if (process.argv.includes("--run"))
  app.listen(PORT, () => { console.log(`Blockchain server is running on port ${PORT}`); });

export { app };

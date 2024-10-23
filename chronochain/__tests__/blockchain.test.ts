import e from "express";
import Block from "../src/lib/block";
import Blockchain from "../src/lib/blockchain";
import Transaction from "../src/lib/transaction";
import TransactionInput from "../src/lib/transactionInput";

jest.mock("../src/lib/block");
jest.mock("../src/lib/transaction");
jest.mock("../src/lib/transactionInput");

describe("Blockchain tests", () => {
  it("should have genesis block", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks.length).toBe(1);
  });

  it("should be valid (genesis)", () => {
    const blockchain = new Blockchain();
    expect(blockchain.isValid().success).toBe(true);
  });

  it("should GET block", () => {
    const blockchain = new Blockchain();
    const block = blockchain.getBlock(blockchain.blocks[0].hash);
    expect(block).toBeTruthy();
  });

  it("should add transaction", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({
      txInput: new TransactionInput(),
      hash: "xyz",
    } as Transaction);

    const validation = blockchain.addTransaction(tx);
    expect(validation.success).toBe(true);
  });

  it("should NOT add transaction (invalid tx)", () => {
    const blockchain = new Blockchain();
    const txInput = new TransactionInput();
    txInput.amount = -1;
    const tx = new Transaction({
      txInput,
      hash: "xyz",
    } as Transaction);

    const validation = blockchain.addTransaction(tx);
    expect(validation.success).toBe(false);
  });

  it("should NOT add transaction (duplicated in blockchain)", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({
      txInput: new TransactionInput(),
      hash: "xyz",
    } as Transaction);

    blockchain.blocks.push(
      new Block({
        transactions: [tx],
      } as Block)
    );

    const validation = blockchain.addTransaction(tx);
    expect(validation.success).toBe(false);
  });

  it("should NOT add transaction (duplicated in mempool)", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({
      txInput: new TransactionInput(),
      hash: "xyz",
    } as Transaction);

    blockchain.mempool.push(tx);

    const validation = blockchain.addTransaction(tx);
    expect(validation.success).toBe(false);
  });

  it("should get transaction (mempool)", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({
      txInput: new TransactionInput(),
      hash: "xyz",
    } as Transaction);

    blockchain.mempool.push(tx);

    const search = blockchain.getTransaction("xyz");
    expect(search.mempoolIndex).toBe(0);
  });

  it("should get transaction (blockchain)", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({
      txInput: new TransactionInput(),
      hash: "xyz",
    } as Transaction);

    blockchain.blocks.push(
      new Block({
        transactions: [tx],
      } as Block)
    );

    const search = blockchain.getTransaction("xyz");
    expect(search.blockIndex).toBe(1);
  });

  it("should NOT get transaction", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({
      txInput: new TransactionInput(),
      hash: "xyz",
    } as Transaction);

    const search = blockchain.getTransaction("xyz");
    expect(search.mempoolIndex).toBe(-1);
    expect(search.blockIndex).toBe(-1);
  });

  it("should be valid (new block)", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({
      txInput: new TransactionInput(),
    } as Transaction);

    blockchain.mempool.push(tx);

    const block = new Block({
      index: 1,
      previousHash: blockchain.getLastBlock().hash,
      transactions: [tx],
    } as Block);
    const blockAdded = blockchain.addBlock(block);
    expect(blockAdded.success).toBe(true);
  });

  it("should be valid (two blocks)", () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.getLastBlock().hash,
        transactions: [
          new Transaction({
            txInput: new TransactionInput(),
          } as Transaction),
        ],
      } as Block)
    );
    expect(blockchain.isValid().success).toBe(true);
  });

  it("should NOT be valid (invalid block)", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({
      txInput: new TransactionInput(),
    } as Transaction);

    blockchain.mempool.push(tx);

    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.getLastBlock().hash,
        transactions: [tx],
      } as Block)
    );
    blockchain.blocks[1].index = -1;
    expect(blockchain.isValid().success).toBe(false);
  });

  it("should NOT add a block", () => {
    const blockchain = new Blockchain();
    const block = new Block({
      index: -1,
      previousHash: blockchain.getLastBlock().hash,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    const blockAdded = blockchain.addBlock(block);
    expect(blockAdded.success).toBe(false);
  });

  it("should get next block info", () => {
    const blockchain = new Blockchain();
    blockchain.mempool.push(new Transaction());

    const info = blockchain.getNextBlock();
    expect(info ? info.index : 0).toBe(1);
  });

  it("should NOT get next block info", () => {
    const blockchain = new Blockchain();
    const info = blockchain.getNextBlock();
    expect(info).toBeNull();
  });
});

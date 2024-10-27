import e from "express";
import Block from "../src/lib/block";
import Blockchain from "../src/lib/blockchain";
import Transaction from "../src/lib/transaction";
import TransactionInput from "../src/lib/transactionInput";
import Wallet from "../src/lib/wallet";
import TransactionType from "../src/lib/transactionType";
import TransactionOutput from "../src/lib/transactionOutput";

jest.mock("../src/lib/block");
jest.mock("../src/lib/transaction");
jest.mock("../src/lib/transactionInput");

describe("Blockchain tests", () => {
  let alice: Wallet;

  beforeAll(() => {
    alice = new Wallet();
  });

  it("should have genesis block", () => {
    const blockchain = new Blockchain(alice.publicKey);
    expect(blockchain.blocks.length).toBe(1);
  });

  it("should be valid (genesis)", () => {
    const blockchain = new Blockchain(alice.publicKey);
    expect(blockchain.isValid().success).toBe(true);
  });

  it("should GET block", () => {
    const blockchain = new Blockchain(alice.publicKey);
    const block = blockchain.getBlock(blockchain.blocks[0].hash);
    expect(block).toBeTruthy();
  });

  it("should add transaction", () => {
    const blockchain = new Blockchain(alice.publicKey);
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      hash: "xyz",
    } as Transaction);

    const validation = blockchain.addTransaction(tx);
    expect(validation.success).toBe(true);
  });

  it("should NOT add transaction (pending tx)", () => {
    const blockchain = new Blockchain(alice.publicKey);
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      hash: "xyz",
    } as Transaction);
    blockchain.addTransaction(tx);

    const tx2 = new Transaction({
      txInputs: [new TransactionInput()],
      hash: "xyz2",
    } as Transaction);

    const validation = blockchain.addTransaction(tx2);
    expect(validation.success).toBe(false);
  });

  it("should NOT add transaction (invalid tx)", () => {
    const blockchain = new Blockchain(alice.publicKey);

    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      hash: "xyz",
      timestamp: -1,
    } as Transaction);

    const validation = blockchain.addTransaction(tx);
    expect(validation.success).toBe(false);
  });

  it("should NOT add transaction (duplicated in blockchain)", () => {
    const blockchain = new Blockchain(alice.publicKey);
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
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

  it("should get transaction (mempool)", () => {
    const blockchain = new Blockchain(alice.publicKey);
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      hash: "xyz",
    } as Transaction);

    blockchain.mempool.push(tx);

    const search = blockchain.getTransaction("xyz");
    expect(search.mempoolIndex).toBe(0);
  });

  it("should get transaction (blockchain)", () => {
    const blockchain = new Blockchain(alice.publicKey);
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
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
    const blockchain = new Blockchain(alice.publicKey);
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      hash: "xyz",
    } as Transaction);

    const search = blockchain.getTransaction("xyz");
    expect(search.mempoolIndex).toBe(-1);
    expect(search.blockIndex).toBe(-1);
  });

  it("should be valid (new block)", () => {
    const blockchain = new Blockchain(alice.publicKey);
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
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

  it("should NOT be valid (invalid mempool)", () => {
    const blockchain = new Blockchain(alice.publicKey);
    blockchain.mempool.push(new Transaction());
    blockchain.mempool.push(new Transaction());

    const tx = new Transaction({
      txInputs: [new TransactionInput()],
    } as Transaction);

    const block = new Block({
      index: 1,
      previousHash: blockchain.getLastBlock().hash,
      transactions: [tx],
    } as Block);
    const blockAdded = blockchain.addBlock(block);
    expect(blockAdded.success).toBe(false);
  });

  it("should be valid (two blocks)", () => {
    const blockchain = new Blockchain(alice.publicKey);
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.getLastBlock().hash,
        transactions: [
          new Transaction({
            txInputs: [new TransactionInput()],
          } as Transaction),
        ],
      } as Block)
    );
    expect(blockchain.isValid().success).toBe(true);
  });

  it("should NOT be valid (invalid block)", () => {
    const blockchain = new Blockchain(alice.publicKey);
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
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
    const blockchain = new Blockchain(alice.publicKey);
    blockchain.mempool.push(new Transaction());

    const block = new Block({
      index: -1,
      previousHash: blockchain.getLastBlock().hash,
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [
          new TransactionOutput({
            toAddress: alice.publicKey,
            amount: 1,
          } as TransactionOutput),
        ],
      } as Transaction)
    );

    block.hash = block.getHash();
    const blockAdded = blockchain.addBlock(block);
    expect(blockAdded.success).toBe(false);
  });

  it("should get next block info", () => {
    const blockchain = new Blockchain(alice.publicKey);
    blockchain.mempool.push(new Transaction());

    const info = blockchain.getNextBlock();
    expect(info ? info.index : 0).toBe(1);
  });

  it("should NOT get next block info", () => {
    const blockchain = new Blockchain(alice.publicKey);
    const info = blockchain.getNextBlock();
    expect(info).toBeNull();
  });
});

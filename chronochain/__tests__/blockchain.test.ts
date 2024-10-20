import e from "express";
import Block from "../src/lib/block";
import Blockchain from "../src/lib/blockchain";
import Transaction from "../src/lib/transaction";

jest.mock("../src/lib/block");
jest.mock("../src/lib/transaction");

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

  it("should be valid (new block)", () => {
    const blockchain = new Blockchain();
    const block = new Block({
      index: 1,
      previousHash: blockchain.getLastBlock().hash,
      transactions: [
        new Transaction({
          data: new Date().toString(),
        } as Transaction),
      ],
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
            data: new Date().toString(),
          } as Transaction),
        ],
      } as Block)
    );
    expect(blockchain.isValid().success).toBe(true);
  });

  it("should NOT be valid (invalid block)", () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.getLastBlock().hash,
        transactions: [
          new Transaction({
            data: new Date().toString(),
          } as Transaction),
        ],
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
          data: new Date().toString(),
        } as Transaction),
      ],
    } as Block);
    const blockAdded = blockchain.addBlock(block);
    expect(blockAdded.success).toBe(false);
  });

  it("should get next block info", () => {
    const blockchain = new Blockchain();
    const info = blockchain.getNextBlock();
    expect(info.index).toBe(1);
  });
});

import e from "express";
import Block from "../src/lib/block";
import BlockInfo from "../src/lib/blockInfo";
import Transaction from "../src/lib/transaction";
import TransactionType from "../src/lib/transactionType";
import TransactionInput from "../src/lib/transactionInput";

jest.mock("../src/lib/transaction");
jest.mock("../src/lib/transactionInput");

describe("Block tests", () => {
  const difficulty = 0;
  const miner = "luciano";
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block({
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
  });

  it("should be valid", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    block.mine(difficulty, miner);
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    console.log(valid);
    expect(valid.success).toBeTruthy();
  });

  it("should be valid", () => {
    const block = Block.fromBlockInfo({
      index: 1,
      previousHash: genesis.hash,
      difficulty: difficulty,
      maxDifficulty: 10,
      feePerTx: 1,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as BlockInfo);
    block.mine(difficulty, miner);
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    expect(valid.success).toBeTruthy();
  });

  it("should NOT be valid (2 FEE tx)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          type: TransactionType.FEE,
          txInput: new TransactionInput(),
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    block.mine(difficulty, miner);
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    console.log(valid);
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (no transactions)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [] as Transaction[],
    } as Block);

    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (tx invalid - data missing)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [new Transaction()],
    } as Block);
    block.mine(difficulty, miner);

    block.transactions[0].to = "";
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (fallback)", () => {
    const block = new Block();
    expect(
      block.isValid(genesis.hash, genesis.index, difficulty).success
    ).toBeFalsy();
  });

  it("should NOT be valid (previous hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: "abc",
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    expect(block.isValid(genesis.hash, genesis.index, difficulty).success).toBe(
      false
    );
  });

  it("should NOT be valid (index)", () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    expect(block.isValid(genesis.hash, genesis.index, difficulty).success).toBe(
      false
    );
  });

  it("should NOT be valid (timestamp)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    block.timestamp = -1;
    block.hash = block.getHash();
    expect(block.isValid(genesis.hash, genesis.index, difficulty).success).toBe(
      false
    );
  });

  it("should NOT be valid (data)", () => {
    const txInput = new TransactionInput();
    txInput.amount = -1;

    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(txInput),
        } as Transaction),
      ],
    } as Block);
    expect(block.isValid(genesis.hash, genesis.index, difficulty).success).toBe(
      false
    );
  });

  it("should NOT be valid (hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    block.mine(difficulty, miner);
    block.hash = "";
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (no mined)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    expect(valid.success).toBeFalsy();
  });
});

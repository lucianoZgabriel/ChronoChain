import e from "express";
import Block from "../src/lib/block";
import BlockInfo from "../src/lib/blockInfo";
import Transaction from "../src/lib/transaction";
import TransactionType from "../src/lib/transactionType";
import TransactionInput from "../src/lib/transactionInput";
import TransactionOutput from "../src/lib/transactionOutput";
import Wallet from "../src/lib/wallet";

jest.mock("../src/lib/transaction");
jest.mock("../src/lib/transactionInput");
jest.mock("../src/lib/transactionOutput");

describe("Block tests", () => {
  const difficulty = 1;
  let alice: Wallet;
  let genesis: Block;

  beforeAll(() => {
    alice = new Wallet();

    genesis = new Block({
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);
  });

  it("should be valid", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [] as Transaction[],
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

    block.mine(difficulty, alice.publicKey);
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    expect(valid.success).toBeTruthy();
  });

  it("should NOT be valid (different hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [] as Transaction[],
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

    block.mine(difficulty, alice.publicKey);

    block.hash = "abc";

    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (no fee)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);

    block.mine(difficulty, alice.publicKey);
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    expect(valid.success).toBeFalsy();
  });

  it("should be valid creating from block info", () => {
    const block = Block.fromBlockInfo({
      index: 1,
      previousHash: genesis.hash,
      difficulty: difficulty,
      maxDifficulty: 10,
      feePerTx: 1,
      transactions: [],
    } as BlockInfo);

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

    block.mine(difficulty, alice.publicKey);
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
          txInputs: [new TransactionInput()],
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);
    block.mine(difficulty, alice.publicKey);
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
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
      transactions: [] as Transaction[],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        timestamp: -1,
        txOutputs: [
          new TransactionOutput({
            toAddress: alice.publicKey,
            amount: 1,
          } as TransactionOutput),
        ],
      } as Transaction)
    );
    block.hash = block.getHash();

    block.mine(difficulty, alice.publicKey);

    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    console.log(valid.message);
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (fallback)", () => {
    const block = new Block();
    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [new TransactionOutput()],
      } as Transaction)
    );
    block.hash = block.getHash();

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
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
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
    block.mine(difficulty, alice.publicKey);

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
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
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
    block.mine(difficulty, alice.publicKey);

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
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);
    block.timestamp = -1;

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
    block.mine(difficulty, alice.publicKey);

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
          txInputs: [new TransactionInput(txInput)],
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
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [new TransactionOutput()],
      } as Transaction)
    );
    block.hash = block.getHash();

    block.mine(difficulty, alice.publicKey);
    block.hash = "";
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (no mined)", () => {
    const block = new Block({
      index: 1,
      nonce: 0,
      miner: alice.publicKey,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
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

    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    expect(valid.success).toBeFalsy();
  });
});

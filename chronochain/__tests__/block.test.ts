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
  const difficulty: number = 1;
  const exampleFee: number = 1;
  const exampleTx: string =
    "9dd6593a97e019be9e550466b2eec5a0ee3708ae313f570a70fdf4ffcac919ef";
  let alice: Wallet, bob: Wallet;
  let genesis: Block;

  beforeAll(() => {
    alice = new Wallet();
    bob = new Wallet();

    genesis = new Block({
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);
  });

  function getFullBlock(): Block {
    const txIn = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: exampleTx,
    } as TransactionInput);
    txIn.sign(alice.privateKey);

    const txOut = new TransactionOutput({
      toAddress: bob.publicKey,
      amount: 10,
    } as TransactionOutput);

    const tx = new Transaction({
      txInputs: [txIn],
      txOutputs: [txOut],
    } as Transaction);

    const txFee = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [
        new TransactionOutput({
          toAddress: alice.publicKey,
          amount: 1,
        } as TransactionOutput),
      ],
    } as Transaction);

    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [tx, txFee],
    } as Block);

    block.mine(difficulty, alice.publicKey);

    return block;
  }

  it("should be valid", () => {
    const block = getFullBlock();
    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      difficulty,
      exampleFee
    );
    expect(valid.success).toBeTruthy();
  });

  it("should NOT be valid (different hash)", () => {
    const block = getFullBlock();
    block.hash = "abc";

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      difficulty,
      exampleFee
    );
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
    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      difficulty,
      exampleFee
    );
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
    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      difficulty,
      exampleFee
    );
    expect(valid.success).toBeTruthy();
  });

  it("should NOT be valid (2 FEE tx)", () => {
    const block = getFullBlock();

    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [new TransactionOutput()],
    } as Transaction);
    tx.txInputs = undefined;

    block.transactions.push(tx);

    block.mine(difficulty, alice.publicKey);
    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      difficulty,
      exampleFee
    );
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (no transactions)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [] as Transaction[],
    } as Block);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      difficulty,
      exampleFee
    );
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (tx invalid)", () => {
    const block = getFullBlock();
    block.transactions[0].timestamp = -1;
    block.hash = block.getHash();
    block.mine(difficulty, alice.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      difficulty,
      exampleFee
    );
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
      block.isValid(genesis.hash, genesis.index, difficulty, exampleFee).success
    ).toBeFalsy();
  });

  it("should NOT be valid (previous hash)", () => {
    const block = getFullBlock();
    block.previousHash = "abcderf";
    block.mine(difficulty, alice.publicKey);

    expect(
      block.isValid(genesis.hash, genesis.index, difficulty, exampleFee).success
    ).toBe(false);
  });

  it("should NOT be valid (index)", () => {
    const block = getFullBlock();
    block.index = -1;

    expect(
      block.isValid(genesis.hash, genesis.index, difficulty, exampleFee).success
    ).toBe(false);
  });

  it("should NOT be valid (timestamp)", () => {
    const block = getFullBlock();
    block.timestamp = -1;
    block.mine(difficulty, alice.publicKey);

    expect(
      block.isValid(genesis.hash, genesis.index, difficulty, exampleFee).success
    ).toBe(false);
  });

  it("should NOT be valid (empty hash)", () => {
    const block = getFullBlock();
    block.hash = "";
    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      difficulty,
      exampleFee
    );
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (no mined)", () => {
    const block = getFullBlock();
    block.nonce = 0;

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      difficulty,
      exampleFee
    );
    expect(valid.success).toBeFalsy();
  });
});

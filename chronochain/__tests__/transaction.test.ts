import Block from "../src/lib/block";
import BlockInfo from "../src/lib/blockInfo";
import Transaction from "../src/lib/transaction";
import TransactionType from "../src/lib/transactionType";
import TransactionInput from "../src/lib/transactionInput";
import TransactionOutput from "../src/lib/transactionOutput";
import Wallet from "../src/lib/wallet";

jest.mock("../src/lib/transactionInput");
jest.mock("../src/lib/transactionOutput");

describe("Transaction tests", () => {
  let alice: Wallet, bob: Wallet;
  const exampleDifficulty: number = 1;
  const exampleFee: number = 1;
  const exampleTx: string =
    "9dd6593a97e019be9e550466b2eec5a0ee3708ae313f570a70fdf4ffcac919ef";

  beforeAll(() => {
    alice = new Wallet();
    bob = new Wallet();
  });

  it("should be valid (REGULAR default)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
    } as Transaction);
    const valid = tx.isValid(exampleDifficulty, exampleFee);
    expect(valid.success).toBeTruthy();
  });

  it("should NOT be valid (invalid hash)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: "invalid",
    } as Transaction);
    const valid = tx.isValid(exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it("should be valid (FEE)", () => {
    const tx = new Transaction({
      txOutputs: [new TransactionOutput()],
      type: TransactionType.FEE,
    } as Transaction);

    tx.txInputs = undefined;
    tx.hash = tx.getHash();

    const valid = tx.isValid(exampleDifficulty, exampleFee);
    expect(valid.success).toBeTruthy();
  });

  it("should NOT be valid (invalid to)", () => {
    const tx = new Transaction();
    const valid = tx.isValid(exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (invalid txInput)", () => {
    const tx = new Transaction({
      txOutputs: [new TransactionOutput()],
      txInputs: [
        new TransactionInput({
          fromAddress: "carteira2",
          amount: -10,
          signature: "abc",
        } as TransactionInput),
      ],
    } as Transaction);
    const valid = tx.isValid(exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (input < output)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput({ amount: 10 } as TransactionInput)],
      txOutputs: [new TransactionOutput({ amount: 20 } as TransactionOutput)],
    } as Transaction);
    const valid = tx.isValid(exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (txOutput hash !== tx hash)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
    } as Transaction);

    tx.txOutputs[0].tx = "invalid";
    const valid = tx.isValid(exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it("should get fee", () => {
    const txIn = new TransactionInput({
      amount: 11,
      fromAddress: alice.publicKey,
      previousTx: exampleTx,
    } as TransactionInput);
    txIn.sign(alice.privateKey);

    const txOut = new TransactionOutput({
      amount: 10,
      toAddress: bob.publicKey,
    } as TransactionOutput);

    const tx = new Transaction({
      txInputs: [txIn],
      txOutputs: [txOut],
    } as Transaction);

    const result = tx.getFee();
    expect(result).toBeGreaterThan(0);
  });

  it("should get zero fee", () => {
    const tx = new Transaction();
    tx.txInputs = undefined;
    const result = tx.getFee();
    expect(result).toBe(0);
  });

  it("should create from reward()", () => {
    const tx = Transaction.fromReward({
      toAddress: alice.publicKey,
      amount: 10,
    } as TransactionOutput);

    const result = tx.isValid(exampleDifficulty, exampleFee);
    expect(result.success).toBeTruthy();
  });

  it("should NOT be valid (invalid fee amount)", () => {
    const txOut = new TransactionOutput({
      amount: Number.MAX_SAFE_INTEGER,
      toAddress: bob.publicKey,
    } as TransactionOutput);

    const tx = new Transaction({
      txOutputs: [txOut],
      type: TransactionType.FEE,
    } as Transaction);

    const result = tx.isValid(exampleDifficulty, exampleFee);
    expect(result.success).toBeFalsy();
  });
});

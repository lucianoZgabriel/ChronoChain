import Block from "../src/lib/block";
import BlockInfo from "../src/lib/blockInfo";
import Transaction from "../src/lib/transaction";
import TransactionType from "../src/lib/transactionType";
import TransactionInput from "../src/lib/transactionInput";
import TransactionOutput from "../src/lib/transactionOutput";

jest.mock("../src/lib/transactionInput");
jest.mock("../src/lib/transactionOutput");

describe("Transaction tests", () => {
  const difficulty = 0;
  const miner = "luciano";
  let genesis: Block;

  it("should be valid (REGULAR default)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
    } as Transaction);
    const valid = tx.isValid();
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
    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  it("should be valid (FEE)", () => {
    const tx = new Transaction({
      txOutputs: [new TransactionOutput()],
      type: TransactionType.FEE,
    } as Transaction);

    tx.txInputs = undefined;
    tx.hash = tx.getHash();

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  it("should NOT be valid (invalid to)", () => {
    const tx = new Transaction();
    const valid = tx.isValid();
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
    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (input < output)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput({ amount: 10 } as TransactionInput)],
      txOutputs: [new TransactionOutput({ amount: 20 } as TransactionOutput)],
    } as Transaction);
    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (txOutput hash !== tx hash)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
    } as Transaction);

    tx.txOutputs[0].tx = "invalid";
    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });
});

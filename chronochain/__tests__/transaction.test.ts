import Block from "../src/lib/block";
import BlockInfo from "../src/lib/blockInfo";
import Transaction from "../src/lib/transaction";
import TransactionType from "../src/lib/transactionType";
import TransactionInput from "../src/lib/transactionInput";

jest.mock("../src/lib/transactionInput");

describe("Transaction tests", () => {
  const difficulty = 0;
  const miner = "luciano";
  let genesis: Block;

  it("should be valid (REGULAR default)", () => {
    const tx = new Transaction({
      txInput: new TransactionInput(),
      to: "carteira1",
    } as Transaction);
    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  it("should NOT be valid (invalid hash)", () => {
    const tx = new Transaction({
      txInput: new TransactionInput(),
      to: "carteira1",
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: "invalid",
    } as Transaction);
    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  it("should be valid (FEE)", () => {
    const tx = new Transaction({
      txInput: new TransactionInput(),
      to: "carteira1",
      type: TransactionType.FEE,
    } as Transaction);

    tx.txInput = undefined;
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
      to: "carteira1",
      txInput: new TransactionInput({
        fromAddress: "carteira2",
        amount: -10,
        signature: "abc",
      } as TransactionInput),
    } as Transaction);
    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });
});

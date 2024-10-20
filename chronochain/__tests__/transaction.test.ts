import Block from "../src/lib/block";
import BlockInfo from "../src/lib/blockInfo";
import Transaction from "../src/lib/transaction";
import TransactionType from "../src/lib/transactionType";

describe("Transaction tests", () => {
  const difficulty = 0;
  const miner = "luciano";
  let genesis: Block;

  it("should be valid (REGULAR default)", () => {
    const tx = new Transaction({
      data: "tx",
    } as Transaction);
    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  it("should NOT be valid (invalid hash)", () => {
    const tx = new Transaction({
      data: "tx",
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: "invalid",
    } as Transaction);
    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  it("should be valid (FEE)", () => {
    const tx = new Transaction({
      data: "tx",
      type: TransactionType.FEE,
    } as Transaction);
    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  it("should NOT be valid (invalid data)", () => {
    const tx = new Transaction();
    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });
});

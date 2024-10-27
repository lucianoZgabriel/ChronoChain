import TransactionOutput from "../src/lib/transactionOutput";
import Wallet from "../src/lib/wallet";

describe("TransactionOutput test", () => {
  let alice: Wallet, bob: Wallet;

  beforeAll(() => {
    alice = new Wallet();
    bob = new Wallet();
  });

  test("should be valid", () => {
    const txOutput = new TransactionOutput({
      amount: 10,
      toAddress: alice.publicKey,
    } as TransactionOutput);

    const valid = txOutput.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("should NOT be valid (DEFAULT)", () => {
    const txOutput = new TransactionOutput();

    const valid = txOutput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("should NOT be valid", () => {
    const txOutput = new TransactionOutput({
      amount: -10,
      toAddress: alice.publicKey,
    } as TransactionOutput);

    const valid = txOutput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("should get hash", () => {
    const txOutput = new TransactionOutput({
      amount: 10,
      toAddress: alice.publicKey,
    } as TransactionOutput);

    const hash = txOutput.getHash();
    expect(hash).toBeTruthy();
  });
});

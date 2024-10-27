import TransactionInput from "../src/lib/transactionInput";
import Wallet from "../src/lib/wallet";

describe("TransactionInput test", () => {
  let alice: Wallet, bob: Wallet;

  beforeAll(() => {
    alice = new Wallet();
    bob = new Wallet();
  });

  it("should be valid", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: "xyz",
    } as TransactionInput);
    txInput.sign(alice.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeTruthy();
  });

  it("should NOT be valid (no signature)", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
    } as TransactionInput);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (invalid amout)", () => {
    const txInput = new TransactionInput({
      amount: -10,
      fromAddress: alice.publicKey,
      previousTx: "xyz",
    } as TransactionInput);
    txInput.sign(alice.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (invalid signature)", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: "xyz",
    } as TransactionInput);
    txInput.sign(bob.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (defaults)", () => {
    const txInput = new TransactionInput();
    txInput.sign(alice.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (no previous tx)", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
    } as TransactionInput);
    txInput.sign(alice.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });
});

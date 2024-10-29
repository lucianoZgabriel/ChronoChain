import TransactionInput from "../src/lib/transactionInput";
import TransactionOutput from "../src/lib/transactionOutput";
import Wallet from "../src/lib/wallet";

describe("TransactionInput test", () => {
  let alice: Wallet, bob: Wallet;
  const exampleTx: string =
    "9dd6593a97e019be9e550466b2eec5a0ee3708ae313f570a70fdf4ffcac919ef";

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

  it("should create fromTxo()", () => {
    const txInput = TransactionInput.fromTxo({
      amount: 10,
      toAddress: alice.publicKey,
      tx: exampleTx,
    } as TransactionOutput);
    txInput.sign(alice.privateKey);

    txInput.amount = 11;
    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  }
  )
});

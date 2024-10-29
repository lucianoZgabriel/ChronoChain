import TransactionType from "./transactionType";
import sha256 from "crypto-js/sha256";
import Validation from "./validation";
import TransactionInput from "./transactionInput";
import TransactionOutput from "./transactionOutput";
import Blockchain from "./blockchain";

export default class Transaction {
  type: TransactionType;
  timestamp: number;
  hash: string;
  txInputs: TransactionInput[] | undefined;
  txOutputs: TransactionOutput[];

  constructor(tx?: Transaction) {
    this.type = tx?.type || TransactionType.REGULAR;
    this.timestamp = tx?.timestamp || Date.now();

    this.txInputs = tx?.txInputs
      ? tx.txInputs.map((txInput) => new TransactionInput(txInput))
      : undefined;
    this.txOutputs = tx?.txOutputs
      ? tx.txOutputs.map((txOutput) => new TransactionOutput(txOutput))
      : [];

    this.hash = tx?.hash || this.getHash();

    this.txOutputs.forEach(
      (txOutput, index, arr) => (arr[index].tx = this.hash)
    );
  }

  getHash(): string {
    const from =
      this.txInputs && this.txInputs.length
        ? this.txInputs.map((txi) => txi.signature).join(",")
        : "";
    const to =
      this.txOutputs && this.txOutputs.length
        ? this.txOutputs.map((txi) => txi.getHash()).join(",")
        : "";
    return sha256(this.type + this.timestamp + to + from).toString();
  }

  getFee(): number {
    let inputSum = 0,
      outputSum = 0;
    if (this.txInputs && this.txInputs.length) {
      inputSum = this.txInputs.map((txi) => txi.amount).reduce((a, b) => a + b);

      if (this.txOutputs && this.txOutputs.length)
        outputSum = this.txOutputs
          .map((txo) => txo.amount)
          .reduce((a, b) => a + b);

      return inputSum - outputSum;
    }
    return 0;
  }

  isValid(difficulty: number, totalFees: number): Validation {
    if (this.hash !== this.getHash())
      return new Validation(false, "Invalid hash");
    if (
      !this.txOutputs ||
      !this.txOutputs.length ||
      this.txOutputs.map((txo) => txo.isValid()).some((v) => !v.success)
    )
      return new Validation(false, "Invalid txOutputs");
    if (this.txInputs && this.txInputs.length) {
      const validations = this.txInputs
        .map((txi) => txi.isValid())
        .filter((v) => !v.success);
      if (validations && validations.length) {
        const message = validations.map((v) => v.message).join(", ");
        return new Validation(false, `Invalid txInputs: ${message}`);
      }

      const inputSum = this.txInputs
        .map((txi) => txi.amount)
        .reduce((a, b) => a + b, 0);
      const outputSum = this.txOutputs
        .map((txo) => txo.amount)
        .reduce((a, b) => a + b, 0);
      if (inputSum < outputSum)
        return new Validation(false, "Invalid txInputs: insufficient funds");
    }

    if (this.txOutputs.some((txo) => txo.tx !== this.hash))
      return new Validation(false, "Invalid txOutputs: invalid tx hash");

    if (this.type === TransactionType.FEE) {
      const txo = this.txOutputs[0];
      if (txo.amount > Blockchain.getRewardAmout(difficulty) + totalFees)
        return new Validation(
          false,
          "Invalid txOutputs: invalid reward amount"
        );
    }

    return new Validation();
  }

  static fromReward(txo: TransactionOutput): Transaction {
    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [txo],
    } as Transaction);

    tx.hash = tx.getHash();
    tx.txOutputs[0].tx = tx.hash;
    return tx;
  }
}

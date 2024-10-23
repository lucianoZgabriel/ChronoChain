import Validation from "../validation";

export default class TransactionInput {
  fromAddress: string;
  amount: number;
  signature: string;

  constructor(txIpunt?: TransactionInput) {
    this.fromAddress = txIpunt?.fromAddress || "carteira1";
    this.amount = txIpunt?.amount || 10;
    this.signature = txIpunt?.signature || "abc";
  }

  sign(privateKey: string) {
    this.signature = "abc";
  }

  getHash(): string {
    return "abc";
  }

  isValid(): Validation {
    if (!this.signature)
      return new Validation(false, "No signature in this transaction input");
    if (this.amount < 1)
      return new Validation(false, "Amount must be greater than 0");

    return new Validation();
  }
}

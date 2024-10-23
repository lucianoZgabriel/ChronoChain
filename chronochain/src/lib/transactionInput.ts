import * as ecc from "tiny-secp256k1";
import ECPairFactory from "ecpair";
import sha256 from "crypto-js/sha256";
import Validation from "./validation";

const ECpair = ECPairFactory(ecc);

export default class TransactionInput {
  fromAddress: string;
  amount: number;
  signature: string;

  constructor(txIpunt?: TransactionInput) {
    this.fromAddress = txIpunt?.fromAddress || "";
    this.amount = txIpunt?.amount || 0;
    this.signature = txIpunt?.signature || "";
  }

  sign(privateKey: string): void {
    const keyPair = ECpair.fromPrivateKey(Buffer.from(privateKey, "hex"));
    const hash = Buffer.from(this.getHash(), "hex");
    const signature = keyPair.sign(hash);

    this.signature = Buffer.from(signature).toString("hex");
  }

  getHash(): string {
    return sha256(this.fromAddress + this.amount).toString();
  }

  isValid(): Validation {
    if (!this.signature)
      return new Validation(false, "No signature in this transaction input");
    if (this.amount < 1)
      return new Validation(false, "Amount must be greater than 0");

    const hash = Buffer.from(this.getHash(), "hex");
    const signatureBuffer = Buffer.from(this.signature, "hex");
    const isValid = ECpair.fromPublicKey(
      Buffer.from(this.fromAddress, "hex")
    ).verify(hash, signatureBuffer);

    return isValid
      ? new Validation()
      : new Validation(false, "Invalid signature");
  }
}

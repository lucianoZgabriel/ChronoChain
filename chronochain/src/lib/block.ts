import sha256 from "crypto-js/sha256";
import Validation from "./validation";

export default class Block {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  data: string;

  constructor(index: number, previousHash: string, data: string) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = Date.now();
    this.data = data;
    this.hash = this.getHash();
  }

  getHash(): string {
    return sha256(
      this.index + this.previousHash + this.timestamp + this.data
    ).toString();
  }

  isValid(previousHash: string, previousIndex: number): Validation {
    if (previousIndex !== this.index - 1)
      return new Validation(false, "Invalid index");
    if (this.previousHash !== previousHash)
      return new Validation(false, "Invalid previous hash");
    if (this.data.length === 0) return new Validation(false, "Invalid data");
    if (this.hash !== this.getHash())
      return new Validation(false, "Invalid hash");
    if (this.timestamp < 1) return new Validation(false, "Invalid timestamp");
    return new Validation();
  }
}

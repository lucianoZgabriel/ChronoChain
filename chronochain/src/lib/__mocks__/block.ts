import Transaction from "./transaction";
import Validation from "../validation";

export default class Block {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  transactions: Transaction[];

  constructor(block?: Block) {
    this.index = block?.index || 0;
    this.previousHash = block?.previousHash || "";
    this.timestamp = block?.timestamp || Date.now();
    this.transactions = block?.transactions || ([] as Transaction[]);
    this.hash = block?.hash || this.getHash();
  }

  getHash(): string {
    return this.hash || "abc";
  }

  isValid(previousHash: string, previousIndex: number): Validation {
    if (!previousHash || previousIndex < 0 || this.index < 0) {
      return new Validation(false, "Invalid block");
    }
    return new Validation();
  }
}

import sha256 from "crypto-js/sha256";
import Validation from "./validation";
import BlockInfo from "./blockInfo";
import Transaction from "./transaction";
import TransactionType from "./transactionType";

export default class Block {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
  miner: string;

  constructor(block?: Block) {
    this.index = block?.index || 0;
    this.previousHash = block?.previousHash || "";
    this.timestamp = block?.timestamp || Date.now();
    this.transactions = block?.transactions
      ? block.transactions.map((tx) => new Transaction(tx))
      : ([] as Transaction[]);
    this.nonce = block?.nonce || 0;
    this.miner = block?.miner || "";
    this.hash = block?.hash || this.getHash();
  }

  getHash(): string {
    const txs =
      this.transactions && this.transactions.length
        ? this.transactions.map((tx) => tx.hash).join("")
        : "";
    return sha256(
      this.index +
        this.previousHash +
        this.timestamp +
        txs +
        this.nonce +
        this.miner
    ).toString();
  }

  mine(difficulty: number, miner: string): void {
    this.miner = miner;
    const prefix = new Array(difficulty + 1).join("0");
    do {
      this.nonce++;
      this.hash = this.getHash();
    } while (!this.hash.startsWith(prefix));
  }

  isValid(
    previousHash: string,
    previousIndex: number,
    difficulty: number
  ): Validation {
    if (this.transactions && this.transactions.length) {
      if (
        this.transactions.filter((tx) => tx.type === TransactionType.FEE)
          .length > 1
      )
        return new Validation(false, "Invalid fee transaction");

      const validation = this.transactions.map((tx) => tx.isValid());
      const errors = validation.filter((v) => !v.success).map((v) => v.message);
      if (errors.length > 0)
        return new Validation(
          false,
          "Invalid block due to invalid transaction" + errors.join(", ")
        );
    }

    if (previousIndex !== this.index - 1)
      return new Validation(false, "Invalid index");
    if (this.previousHash !== previousHash)
      return new Validation(false, "Invalid previous hash");
    if (this.transactions.length === 0)
      return new Validation(false, "Invalid data");
    if (this.timestamp < 1) return new Validation(false, "Invalid timestamp");
    if (!this.nonce || !this.miner)
      return new Validation(false, "Invalid miner");

    const prefix = new Array(difficulty + 1).join("0");
    if (this.hash !== this.getHash() || !this.hash.startsWith(prefix))
      return new Validation(false, "Invalid hash");

    return new Validation();
  }

  static fromBlockInfo(blockInfo: BlockInfo): Block {
    const block = new Block();
    block.index = blockInfo.index;
    block.previousHash = blockInfo.previousHash;
    block.transactions = blockInfo.transactions;
    return block;
  }
}

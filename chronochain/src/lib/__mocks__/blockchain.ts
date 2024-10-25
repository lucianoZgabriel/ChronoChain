import Block from "./block";
import Validation from "../validation";
import BlockInfo from "../blockInfo";
import Transaction from "./transaction";
import TransactionType from "../transactionType";
import TransactionSearch from "../transactionSearch";
import TransactionInput from "./transactionInput";
/**
 * Blockchain class
 */
export default class Blockchain {
  blocks: Block[];
  nextIndex: number = 0;
  mempool: Transaction[];
  static readonly DIFFICULTY_FACTOR = 5;
  static readonly MAX_DIFFICULTY = 62;

  constructor(miner: string) {
    this.blocks = [];
    this.mempool = [new Transaction()];
    this.blocks.push(
      new Block({
        hash: "abc",
        index: 0,
        previousHash: "",
        miner,
        timestamp: Date.now(),
      } as Block)
    );
    this.nextIndex++;
  }

  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  addBlock(block: Block): Validation {
    if (block.index < 0)
      return new Validation(false, "Invalid mock block index");
    this.blocks.push(block);
    this.nextIndex++;
    return new Validation();
  }

  addTransaction(transaction: Transaction): Validation {
    if (!transaction.isValid())
      return new Validation(false, "Invalid transaction");
    this.mempool.push(transaction);
    return new Validation();
  }

  getTransaction(hash: string): TransactionSearch {
    if (hash === "-1")
      return {
        mempoolIndex: -1,
        blockIndex: -1,
      } as TransactionSearch;
    return {
      mempoolIndex: 0,
      transaction: new Transaction(),
    } as TransactionSearch;
  }

  getBlock(hash: string): Block | undefined {
    if (!hash || hash === "-1") return undefined;
    return this.blocks.find((b) => b.hash === hash);
  }

  isValid(): Validation {
    return new Validation();
  }

  getFeePerTx(): number {
    return 1;
  }

  getDifficulty(): number {
    return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR);
  }

  getNextBlock(): BlockInfo {
    return {
      transactions: this.mempool.slice(0, 2),
      index: this.blocks.length,
      previousHash: this.getLastBlock().hash,
      difficulty: 1,
      feePerTx: this.getFeePerTx(),
      maxDifficulty: 62,
    };
  }
}

import Block from "./block";
import Validation from "../validation";
import BlockInfo from "../blockInfo";
import Transaction from "./transaction";
import TransactionType from "../transactionType";
/**
 * Blockchain class
 */
export default class Blockchain {
  blocks: Block[];
  nextIndex: number = 0;
  static readonly DIFFICULTY_FACTOR = 5;
  static readonly MAX_DIFFICULTY = 62;

  constructor() {
    this.blocks = [
      new Block({
        hash: "abc",
        index: this.nextIndex,
        previousHash: "0",
        transactions: [new Transaction({
          data: "tx 1",
          type: TransactionType.FEE,
        } as Transaction)],
        timestamp: Date.now(),
      } as Block),
    ];
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

  getBlock(hash: string): Block | undefined {
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
    const transactions = [
      new Transaction({
        data: new Date().toString(),
      } as Transaction),
    ];
    const difficulty = this.getDifficulty();
    const previousHash = this.getLastBlock().hash;
    const index = this.blocks.length;
    const feePerTx = this.getFeePerTx();
    const maxDifficulty = Blockchain.MAX_DIFFICULTY;
    return {
      index,
      previousHash,
      difficulty,
      maxDifficulty,
      feePerTx,
      transactions,
    };
  }
}

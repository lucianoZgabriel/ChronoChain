import Block from "./block";
import Validation from "./validation";
import BlockInfo from "./blockInfo";
import Transaction from "./transaction";
import TransactionType from "./transactionType";
import TrasactionSearch from "./transactionSearch";
import TransactionInput from "./transactionInput";
/**
 * Blockchain class
 */
export default class Blockchain {
  blocks: Block[];
  nextIndex: number = 0;
  mempool: Transaction[];
  static readonly TX_PER_BLOCK = 2;
  static readonly DIFFICULTY_FACTOR = 5;
  static readonly MAX_DIFFICULTY = 62;

  constructor() {
    this.mempool = [];
    this.blocks = [
      new Block({
        index: this.nextIndex,
        previousHash: "",
        transactions: [
          new Transaction({
            type: TransactionType.FEE,
            txInput: new TransactionInput(),
          } as Transaction),
        ],
      } as Block),
    ];
    this.nextIndex++;
  }

  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  addBlock(block: Block): Validation {
    const lastBlock = this.getLastBlock();
    const validation = block.isValid(
      lastBlock.hash,
      lastBlock.index,
      this.getDifficulty()
    );
    if (!validation.success)
      return new Validation(false, `Invalid block: ${validation.message}`);

    const txs = block.transactions
      .filter((tx) => tx.type !== TransactionType.FEE)
      .map((tx) => tx.hash);
    const newMemPool = this.mempool.filter((tx) => !txs.includes(tx.hash));
    if (newMemPool.length + txs.length !== this.mempool.length)
      return new Validation(false, "Invalid tx in block: mempool tampering");

    this.mempool = newMemPool;
    this.blocks.push(block);
    this.nextIndex++;

    return new Validation(true, block.hash);
  }

  getBlock(hash: string): Block | undefined {
    return this.blocks.find((b) => b.hash === hash);
  }

  getTransaction(hash: string): TrasactionSearch {
    const mempoolIndex = this.mempool.findIndex((t) => t.hash === hash);
    if (mempoolIndex !== -1) {
      return {
        mempoolIndex,
        transaction: this.mempool[mempoolIndex],
      } as TrasactionSearch;
    }

    const blockIndex = this.blocks.findIndex((b) =>
      b.transactions.some((t) => t.hash === hash)
    );
    if (blockIndex !== -1) {
      return {
        blockIndex,
        transaction: this.blocks[blockIndex].transactions.find(
          (t) => t.hash === hash
        ),
      } as TrasactionSearch;
    }

    return { blockIndex: -1, mempoolIndex: -1 } as TrasactionSearch;
  }

  getDifficulty(): number {
    return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR);
  }

  addTransaction(transaction: Transaction): Validation {
    if (transaction.txInput) {
      const from = transaction.txInput.fromAddress;
      const pending = this.mempool
        .map((tx) => tx.txInput)
        .filter((txInput) => txInput!.fromAddress === from);
      if (pending.length > 0) {
        return new Validation(
          false,
          "There is a pending transaction from the same address"
        );
      }
      //TODO: check if the address has enough balance
    }
    const validation = transaction.isValid();
    if (!validation.success)
      return new Validation(
        false,
        `Invalid transaction: ${validation.message}`
      );
    if (
      this.blocks.some((b) =>
        b.transactions.some((tx) => tx.hash === transaction.hash)
      )
    )
      return new Validation(false, "Transaction already in blockchain");

    this.mempool.push(transaction);
    return new Validation(true, transaction.hash);
  }

  isValid(): Validation {
    for (let i = this.blocks.length - 1; i > 0; i--) {
      const currentBlock = this.blocks[i];
      const previousBlock = this.blocks[i - 1];
      const validation = currentBlock.isValid(
        previousBlock.hash,
        previousBlock.index,
        this.getDifficulty()
      );
      if (!validation.success)
        return new Validation(
          false,
          `Block ${i} is invalid: ${validation.message}`
        );
    }
    return new Validation();
  }

  getFeePerTx(): number {
    return 1;
  }

  getNextBlock(): BlockInfo | null {
    if (!this.mempool || !this.mempool.length) return null;

    const transactions = this.mempool.slice(0, Blockchain.TX_PER_BLOCK);
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
    } as BlockInfo;
  }
}

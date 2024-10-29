import Block from "./block";
import Validation from "./validation";
import BlockInfo from "./blockInfo";
import Transaction from "./transaction";
import TransactionType from "./transactionType";
import TrasactionSearch from "./transactionSearch";
import TransactionInput from "./transactionInput";
import TransactionOutput from "./transactionOutput";
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

  constructor(miner: string) {
    this.blocks = [];
    this.mempool = [];

    const genesis = this.createGenesis(miner);
    this.blocks.push(genesis);
    this.nextIndex++;
  }

  createGenesis(miner: string): Block {
    const amount = Blockchain.getRewardAmout(this.getDifficulty());
    const tx = Transaction.fromReward(
      new TransactionOutput({
        amount,
        toAddress: miner,
      } as TransactionOutput)
    );

    const block = new Block();
    block.transactions = [tx];
    block.mine(this.getDifficulty(), miner);

    return block;
  }

  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  addBlock(block: Block): Validation {
    const nextBlock = this.getNextBlock();
    if (!nextBlock) return new Validation(false, "There is no next block info");

    const validation = block.isValid(
      nextBlock.previousHash,
      nextBlock.index - 1,
      nextBlock.difficulty,
      nextBlock.feePerTx
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
    return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR + 1);
  }

  addTransaction(transaction: Transaction): Validation {
    if (transaction.txInputs && transaction.txInputs.length) {
      const from = transaction.txInputs[0].fromAddress;
      const pending = this.mempool
        .filter((tx) => tx.txInputs && tx.txInputs.length)
        .map((tx) => tx.txInputs)
        .flat()
        .filter((txInput) => txInput!.fromAddress === from);
      if (pending.length > 0) {
        return new Validation(
          false,
          "There is a pending transaction from the same address"
        );
      }

      const utxo = this.getUtxo(from);
      for (let i = 0; i < transaction.txInputs.length; i++) {
        const txInput = transaction.txInputs[i];
        if (
          utxo.findIndex(
            (txOutput) =>
              txOutput.tx === txInput.previousTx &&
              txOutput.amount >= txInput.amount
          ) === -1
        )
          return new Validation(
            false,
            "Invalid transaction input: TXO not found or insufficient funds"
          );
      }
    }

    const validation = transaction.isValid(
      this.getDifficulty(),
      this.getFeePerTx()
    );
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
        this.getDifficulty(),
        this.getFeePerTx()
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

  getTxInputs(wallet: string): (TransactionInput | undefined)[] {
    return this.blocks
      .map((b) => b.transactions)
      .flat()
      .filter((tx) => tx.txInputs && tx.txInputs.length)
      .map((tx) => tx.txInputs)
      .flat()
      .filter((txInput) => txInput!.fromAddress === wallet);
  }

  getTxOutputs(wallet: string): TransactionOutput[] {
    return this.blocks
      .map((b) => b.transactions)
      .flat()
      .filter((tx) => tx.txOutputs && tx.txOutputs.length)
      .map((tx) => tx.txOutputs)
      .flat()
      .filter((txOutput) => txOutput.toAddress === wallet);
  }

  getUtxo(wallet: string): TransactionOutput[] {
    const txInputs = this.getTxInputs(wallet);
    const txOutputs = this.getTxOutputs(wallet);

    if (!txInputs || !txInputs.length) return txOutputs;

    txInputs.forEach((txInput) => {
      const index = txOutputs.findIndex(
        (txOutput) => txOutput!.amount === txInput!.amount
      );
      txOutputs.splice(index, 1);
    });

    return txOutputs;
  }

  getBalance(wallet: string): number {
    const utxo = this.getUtxo(wallet);
    if (!utxo || !utxo.length) return 0;

    return utxo.reduce((acc, txOutput) => acc + txOutput.amount, 0);
  }

  static getRewardAmout(difficulty: number): number {
    return (64 - difficulty) * 10;
  }
}

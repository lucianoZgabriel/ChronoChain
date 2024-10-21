import Transaction from "./transaction";

export default interface TrasactionSearch {
  transaction: Transaction;
  mempoolIndex: number;
  blockIndex: number;
}

import Block from "../src/lib/block";
import Blockchain from "../src/lib/blockchain";

describe("Blockchain tests", () => {
  it("should have genesis block", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks.length).toBe(1);
  });

  it("should be valid (genesis)", () => {
    const blockchain = new Blockchain();
    expect(blockchain.isValid().success).toBe(true);
  });

  it("should be valid (new block)", () => {
    const blockchain = new Blockchain();
    const block = new Block(1, blockchain.getLastBlock().hash, "block1");
    const blockAdded = blockchain.addBlock(block);
    expect(blockAdded.success).toBe(true);
  });

  it("should be valid (two blocks)", () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(new Block(1, blockchain.getLastBlock().hash, "block1"));
    expect(blockchain.isValid().success).toBe(true);
  });

  it("should NOT be valid (invalid block)", () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(new Block(1, blockchain.getLastBlock().hash, "block1"));
    blockchain.blocks[1].data = "instalando malware";
    expect(blockchain.isValid().success).toBe(false);
  });

  it("should NOT add a block", () => {
    const blockchain = new Blockchain();
    const block = new Block(-1, blockchain.getLastBlock().hash, "block1");
    const blockAdded = blockchain.addBlock(block);
    expect(blockAdded.success).toBe(false);
  });
});

import Block from "../src/lib/block";

describe("Block tests", () => {
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block(0, "", "Genesis block");
  });

  it("should be valid", () => {
    const block = new Block(1, genesis.hash, "block1");
    expect(block.isValid(genesis.hash, genesis.index).success).toBe(true);
  });

  it("should NOT be valid (previous hash)", () => {
    const block = new Block(1, "abc", "block2");
    expect(block.isValid(genesis.hash, genesis.index).success).toBe(false);
  });

  it("should NOT be valid (index)", () => {
    const block = new Block(-1, genesis.hash, "block3");
    expect(block.isValid(genesis.hash, genesis.index).success).toBe(false);
  });

  it("should NOT be valid (timestamp)", () => {
    const block = new Block(1, genesis.hash, "block4");
    block.timestamp = -1;
    block.hash = block.getHash();
    expect(block.isValid(genesis.hash, genesis.index).success).toBe(false);
  });

  it("should NOT be valid (data)", () => {
    const block = new Block(1, genesis.hash, "");
    expect(block.isValid(genesis.hash, genesis.index).success).toBe(false);
  });

  it("should NOT be valid (hash)", () => {
    const block = new Block(1, genesis.hash, "block5");
    block.hash = "";
    expect(block.isValid(genesis.hash, genesis.index).success).toBe(false);
  });
});

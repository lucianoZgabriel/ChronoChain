import Block from "../src/lib/block";

describe("Block tests", () => {
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block({ data: "Genesis block" } as Block);
  });

  it("should be valid", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block1",
    } as Block);
    expect(block.isValid(genesis.hash, genesis.index).success).toBe(true);
  });

  it("should NOT be valid (fallback)", () => {
    const block = new Block();
    expect(block.isValid(genesis.hash, genesis.index).success).toBeFalsy();
  });

  it("should NOT be valid (previous hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: "abc",
      data: "block1",
    } as Block);
    expect(block.isValid(genesis.hash, genesis.index).success).toBe(false);
  });

  it("should NOT be valid (index)", () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.hash,
      data: "block1",
    } as Block);
    expect(block.isValid(genesis.hash, genesis.index).success).toBe(false);
  });

  it("should NOT be valid (timestamp)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block1",
    } as Block);
    block.timestamp = -1;
    block.hash = block.getHash();
    expect(block.isValid(genesis.hash, genesis.index).success).toBe(false);
  });

  it("should NOT be valid (data)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "",
    } as Block);
    expect(block.isValid(genesis.hash, genesis.index).success).toBe(false);
  });

  it("should NOT be valid (hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block1",
    } as Block);
    block.hash = "";
    expect(block.isValid(genesis.hash, genesis.index).success).toBe(false);
  });
});

import e from "express";
import Block from "../src/lib/block";
import BlockInfo from "../src/lib/blockInfo";

describe("Block tests", () => {
  const difficulty = 0;
  const miner = "luciano";
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
    block.mine(difficulty, miner);
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    console.log(valid);
    expect(valid.success).toBeTruthy();
  });

  it("should be valid", () => {
    const block = Block.fromBlockInfo({
      index: 1,
      previousHash: genesis.hash,
      difficulty: difficulty,
      maxDifficulty: 10,
      feePerTx: 1,
      data: "block1",
    } as BlockInfo);
    block.mine(difficulty, miner);
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    expect(valid.success).toBeTruthy();
  });
  it("should NOT be valid (fallback)", () => {
    const block = new Block();
    expect(
      block.isValid(genesis.hash, genesis.index, difficulty).success
    ).toBeFalsy();
  });

  it("should NOT be valid (previous hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: "abc",
      data: "block1",
    } as Block);
    expect(block.isValid(genesis.hash, genesis.index, difficulty).success).toBe(
      false
    );
  });

  it("should NOT be valid (index)", () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.hash,
      data: "block1",
    } as Block);
    expect(block.isValid(genesis.hash, genesis.index, difficulty).success).toBe(
      false
    );
  });

  it("should NOT be valid (timestamp)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block1",
    } as Block);
    block.timestamp = -1;
    block.hash = block.getHash();
    expect(block.isValid(genesis.hash, genesis.index, difficulty).success).toBe(
      false
    );
  });

  it("should NOT be valid (data)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "",
    } as Block);
    expect(block.isValid(genesis.hash, genesis.index, difficulty).success).toBe(
      false
    );
  });

  it("should NOT be valid (hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block2",
    } as Block);
    block.mine(difficulty, miner);
    block.hash = "";
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    expect(valid.success).toBeFalsy();
  });

  it("should NOT be valid (no mined)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block2",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, difficulty);
    expect(valid.success).toBeFalsy();
  });
});

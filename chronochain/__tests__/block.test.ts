import Block from "../src/lib/block";

describe("Block tests", () => {
  it("should be valid", () => {
    const block = new Block(0, "hash");
    expect(block.isValid()).toBe(true);
  })

  it("should NOT be valid (hash)", () => {
    const block = new Block(0, "");
    expect(block.isValid()).toBe(false);
  })

  it("should NOT be valid (index)", () => {
    const block = new Block(-1, "hash");
    expect(block.isValid()).toBe(false);
  })
});
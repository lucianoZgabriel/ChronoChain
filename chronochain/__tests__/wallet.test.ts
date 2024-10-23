import Wallet from "../src/lib/wallet";

const exampleWIF = "5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ";
let alice: Wallet;
beforeAll(() => {
  alice = new Wallet();
});

describe("Wallet test", () => {
  it("should generate a key pair", () => {
    const wallet = new Wallet();
    expect(wallet.publicKey).toBeDefined();
    expect(wallet.privateKey).toBeDefined();
  });

  it("should recover wallet from private key", () => {
    const wallet = new Wallet(alice.privateKey);
    expect(wallet.publicKey).toBe(alice.publicKey);
  });

  it("sould recover wallet from WIF", () => {
    const wallet = new Wallet(exampleWIF);
    expect(wallet.publicKey).toBeTruthy();
  });
});

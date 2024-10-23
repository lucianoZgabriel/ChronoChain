import * as ecc from "tiny-secp256k1";
import ECPairFactory, { ECPairInterface } from "ecpair";

const ECpair = ECPairFactory(ecc);

export default class Wallet {
  privateKey: string;
  publicKey: string;

  constructor(wifOrPrivateKey?: string) {
    let keys;
    if (wifOrPrivateKey) {
      if (wifOrPrivateKey.length === 64) {
        keys = ECpair.fromPrivateKey(Buffer.from(wifOrPrivateKey, "hex"));
      } else keys = ECpair.fromWIF(wifOrPrivateKey);
    } else keys = ECpair.makeRandom();
    /* c8 ignore start */
    this.privateKey = keys.privateKey
      ? Buffer.from(keys.privateKey).toString("hex")
      : "";
    /* c8 ignore end */
    this.publicKey = Buffer.from(keys.publicKey).toString("hex");
  }
}

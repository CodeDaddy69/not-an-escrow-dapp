import type BN from "bn.js";
import { PublicKey } from "@solana/web3.js";

export type Listing = {
    bump: number,
    price: BN,
    identifier: BN,
    name: string,
    // TODO: stricter object types
    itemType: object,
    // TODO: stricter object types
    colour: object,
    // condition: {tag: {new:{}}, conditionMap: [{isMajor: true, isFront: true, xPos: 1, yPos: 1}]},
    // TODO: stricter object types
    condition: object,
    seller: PublicKey,
    // saleState: {forSale:{}}
    // TODO: stricter object types
    saleState: object
}

// listing_args = {
//     bump: bump1,
//     price: new anchor.BN(100),
//     identifier: listing_identifier,
//     name: "jacket",
//     itemType: {jacket:{}} as never,
//     colour: {blue:{}} as never,
//     condition: {tag: {new:{} as never}, conditionMap: [{isMajor: true, isFront: true, xPos: 1, yPos: 1}]},
//     seller: receiverKP.publicKey,
//     saleState: {forSale:{}} as never
//   };
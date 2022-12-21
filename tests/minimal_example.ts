import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SystemProgram, PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import KeyPair from "./test_kp.json";
import KeyPair2 from "./receiver.json";
import { Dapp011 } from "../target/types/dapp01_1";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));


const network = "https://api.testnet.solana.com";
const connection = new Connection(network, "confirmed");

const secretarray = Uint8Array.from(KeyPair2);
const testkp = Keypair.fromSecretKey(secretarray);
// const testkp = Keypair.generate()
const testwallet = new Wallet(testkp);

anchor.setProvider(new anchor.AnchorProvider(connection, testwallet, {}));
const program = anchor.workspace.Dapp011 as Program<Dapp011>;




describe("dapp011", () => {
    it("test", async () => {
        // const tx2 = await program.provider.connection.requestAirdrop(program.provider.publicKey, 1*LAMPORTS_PER_SOL);
        // await wait(1000);

        const listing_identifier = new anchor.BN(10);
        const [PDA, bump] = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("listing"),
                program.provider.publicKey.toBuffer(),
                listing_identifier.toArrayLike(Buffer, "le", 8)
                // listing_identifier.toBuffer("le", 8)
            ], 
            program.programId
        );
        
        // let listingArgs = {
        //     bump: bump,
        //     price: new anchor.BN(Number("40")), // new anchor.BN(Number(price)) ????
        //     identifer: listing_identifier,
        //     name: "test",
        //     itemType: { jacket: {} } ,
        //     colour: { blue: {} } ,
        //     condition: {tag: { new: {} }, conditionMap: [{ isMajor: true, isFront: true, xPos: 1, yPos: 1 }]},
        //     seller: program.provider.publicKey,
        //     saleState: { forSale: {} }
        // };

        // console.log(PDA.toString(), bump)

        // console.log(program.provider.publicKey?.toString())


        // const tx = await program.methods.createListing(listingArgs).accounts({
        //     initialiser: program.provider.publicKey,
        //     userListing: PDA,
        //     systemProgram: SystemProgram.programId
        // })
        // .rpc();

        // console.log(tx);

        // const listing_identifier = new anchor.BN(5);

        // // const testkey = new anchor.web3.PublicKey("8PicuETn3oTfcv1JQzxszzD4A4ecsqz3NdJKpYXmW8VJ")
        // // PDA for listing account
        // //  seeds:
        // //    receiver: pubkey
        // //    semi-unique identifier: u64
        // const [PDA1, bump1] = PublicKey.findProgramAddressSync([
        // anchor.utils.bytes.utf8.encode("listing"),
        // program.provider.publicKey.toBuffer(),
        // listing_identifier.toBuffer("le", 8)
        // ], 
        // program.programId
        // );


        let listing_args = {
            bump: bump,
            price: new anchor.BN(Number("100")),
            identifier: listing_identifier,
            name: "jackket",
            itemType: {jacket:{}} ,
            colour: {blue:{}} ,
            condition: {tag: {new:{} }, conditionMap: [{isMajor: true, isFront: true, xPos: 1, yPos: 1}]},
            seller: program.provider.publicKey,
            saleState: {forSale:{}}
          };

        console.log(PDA.toString())
        const tx1 = await program.methods.createListing(listing_args).accounts({
            initialiser: program.provider.publicKey,
            userListing: PDA,
            systemProgram: SystemProgram.programId
            })
            .rpc();

        console.log(tx1)
    })
});
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SystemProgram, PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import KeyPair from "../tests/test_kp.json";
import KeyPair2 from "../tests/receiver.json";
import { Dapp011 } from "../target/types/dapp01_1";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";


export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));


anchor.setProvider(anchor.AnchorProvider.env());
const program = anchor.workspace.Dapp011 as Program<Dapp011>;
const secretarray = Uint8Array.from(KeyPair);
const secretarray2 = Uint8Array.from(KeyPair2);

// variables
// BAdbvA1ecDs9B6Ku829xdDt2HEKbLrKs3BtDK8Mnw22T
const user = (program.provider as anchor.AnchorProvider).wallet; // initialise wallet
const mint = new anchor.web3.PublicKey("71D6j2yhyVfF4V381U7pbxY3sspSYo1Pcd4fV46CxN7a")
// 65Bcbq6SwaEYyxwccnwwWkNJgyfUbgfBWqRDWoezPv7t
const receiverKP = Keypair.fromSecretKey(secretarray2); // authority key 
const dispute_authority = Keypair.fromSecretKey(secretarray); // authority key 


let escrowPDA: anchor.web3.PublicKey;
let escrowATA: anchor.web3.PublicKey;
let initialiserATA: anchor.web3.PublicKey;
let receiverATA: anchor.web3.PublicKey;
let initialiserStatsPDA: anchor.web3.PublicKey;
let receiverStatsPDA: anchor.web3.PublicKey;
let listingpda: anchor.web3.PublicKey;

let listing_identifier;
let listing_args;


describe("dapp011", () => {
    it("test", async () => {
        
        console.log(user.publicKey.toString())
        listing_identifier = new anchor.BN(4)

        // PDA for listing account
        //  seeds:
        //    receiver: pubkey
        //    semi-unique identifier: u64
        const [PDA1, bump1] = await PublicKey.findProgramAddressSync([
          anchor.utils.bytes.utf8.encode("listing"),
          receiverKP.publicKey.toBuffer(),
          listing_identifier.toBuffer("le", 8)
        ], 
        program.programId
        );  
    
        listing_args = {
          bump: bump1,
          price: new anchor.BN(100),
          identifier: listing_identifier,
          name: "jacket",
          itemType: {jacket:{}} as never,
          colour: {blue:{}} as never,
          condition: {tag: {new:{} as never}, conditionMap: [{isMajor: true, isFront: true, xPos: 1, yPos: 1}]},
          seller: receiverKP.publicKey,
          saleState: {forSale:{}} as never
        };
    
        listingpda = PDA1;

        const tx1 = await program.methods.createListing(listing_args).accounts({
            initialiser: receiverKP.publicKey,
            userListing: listingpda,
            systemProgram: SystemProgram.programId
        })
        .signers([receiverKP])
        .rpc();
          
        console.log("SUCCESS 1", tx1);
    })
})

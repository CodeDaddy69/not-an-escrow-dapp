import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SystemProgram, PublicKey, Keypair } from "@solana/web3.js";
import KeyPair from "../tests/test_kp.json";
import KeyPair2 from "../tests/receiver.json";
import { Dapp011 } from "../target/types/dapp01_1";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";


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

       listing_identifier = new anchor.BN(4)

        
        // initialiser associated token address
        initialiserATA = await getAssociatedTokenAddress(mint, user.publicKey);
        // receiver associated token address
        receiverATA = await getAssociatedTokenAddress(mint, receiverKP.publicKey);

        const [PDA3, _bump3] = await PublicKey.findProgramAddressSync([
            anchor.utils.bytes.utf8.encode("user_stats"),
            user.publicKey.toBuffer(),
          ], 
          program.programId
          );
      
          // PDA for receiver account
          //  seeds:
          //    "user_stats": string
          //    receiver: pubkey    
          const [PDA4, _bump4] = await PublicKey.findProgramAddressSync([
            anchor.utils.bytes.utf8.encode("user_stats"),
            receiverKP.publicKey.toBuffer(),
          ], 
          program.programId
          );


        const [PDA1, bump1] = await PublicKey.findProgramAddressSync([
                anchor.utils.bytes.utf8.encode("listing"),
                receiverKP.publicKey.toBuffer(),
                listing_identifier.toBuffer("le", 8)
            ], 
            program.programId
        );  

        listingpda = PDA1

    
        const [PDA2, _bump2] = await PublicKey.findProgramAddress([
            anchor.utils.bytes.utf8.encode("escrow"),
            user.publicKey.toBuffer(),
            listingpda.toBuffer()
        ], 
        program.programId
        );
    
        escrowPDA = PDA2;

        escrowATA = await getAssociatedTokenAddress(mint, escrowPDA, true)

        const tx6 = await program.methods.buyerTransfer().accounts({
            initialiser: user.publicKey,
            mint: mint,
            initialiserTokenAccount: initialiserATA,
            escrow: escrowPDA,
            escrowTokenAccount: escrowATA,
            systemProgram: SystemProgram.programId,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
       //   .signers([initialiserKP])
          .rpc();
        
    })
})

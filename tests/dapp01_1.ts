import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Dapp011 } from "../target/types/dapp01_1";
import { SystemProgram, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getMint, createMint, createMintToInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { program } from "@project-serum/anchor/dist/cjs/spl/associated-token";
import { expect, assert } from "chai";


// my program address
export const ProgramId = new anchor.web3.PublicKey(
  "A1WQcJ7w8QPmyUmjUtfsvVMk47pCYcXSFf9hZq7mRwUF"
  ) 


describe("dapp011", () => {


  // const connection = new Connection('http://127.0.0.1:8899');


  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env()); 
  const program = anchor.workspace.Dapp011 as Program<Dapp011>;

  // variables
  const user = (program.provider as anchor.AnchorProvider).wallet; // initialise wallet
  const receiver = anchor.web3.Keypair.generate(); // initialise receiver

  it("Trade Initialised", async () => {

    // escrow wallet
    const [escrowPDA, _] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("escrow"),
      user.publicKey.toBuffer(),
//      receiver.publicKey.toBuffer()
    ], 
    program.programId
    );


    // initialise mint address
    const mint = anchor.web3.Keypair.generate()
    console.log("mint address:", mint.publicKey.toString())

    // initialise mint account
    const mint_tx = await program.methods
    .createMint()
    .accounts({
      mint: mint.publicKey,
      signer: user.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY
    })
    .signers([mint])
    .rpc();

    // const mintInfo = await program.provider.connection.getParsedAccountInfo(mint.publicKey)
    // console.log(mintInfo.value.data);

    //escrow token account
    const escrowTokenAddress = await getAssociatedTokenAddress(mint.publicKey, escrowPDA, true)
    // create transaction
    const tx = await program.methods.initialiseTransaction(new anchor.BN(100))
    .accounts({
      initialiser: user.publicKey,
      receiver: receiver.publicKey,
      escrowAcc: escrowPDA,
      tokenAccount: escrowTokenAddress,
      mint: mint.publicKey,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY
    })
    .rpc();


    console.log("transaction signature:", tx);

    const escrowAccData = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow account", escrowAccData.amount.toNumber());
    console.log("escrow initialiser", escrowAccData.initialiser.toString());
    console.log("escrow receiver", escrowAccData.receiver.toString());
    console.log("escrow state", Object.keys(escrowAccData.state)[0]);
    assert.equal(escrowAccData.amount.toNumber(), 100, "escrow amount data is equal to expected");
    assert.isTrue(escrowAccData.initialiser.equals(user.publicKey), "escrow initialiser  is equal to expected");
    assert.isTrue(escrowAccData.receiver.equals(receiver.publicKey), "escrow receiver is equal to expected");
    assert.equal(Object.keys(escrowAccData.state)[0], 'initialised');

    const escrowATAData = await program.provider.connection.getParsedAccountInfo(escrowTokenAddress);
    console.log("escrow ATA:", escrowATAData.value.data.valueOf());


  });

  
  // it("Is initialized!", async () => {



    

  //   const userATA = await getAssociatedTokenAddress(mint.publicKey, user.publicKey);

  //   const tx2 = new anchor.web3.Transaction().add( 
  //     createAssociatedTokenAccountInstruction(user.publicKey, userATA, user.publicKey, mint.publicKey)
  //   )
  //   .add( 
  //     createMintToInstruction(mint.publicKey, userATA, user.publicKey, 1000)
  //     );

  //   const signature = await program.provider.sendAndConfirm(tx2);
  //   console.log("Account created with tx:", signature)

  //   const userATAInfo = await program.provider.connection.getParsedAccountInfo(userATA);
  //   console.log(userATAInfo.value.data, userATAInfo.value.data.valueOf());
    


  // });

});

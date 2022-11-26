import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Dapp011 } from "../target/types/dapp01_1";
import { ParsedAccountData, SystemProgram, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, withdrawWithheldTokensFromMint } from "@solana/spl-token";
import { getMint, createMint, createMintToInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { expect, assert } from "chai";

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// my program address
export const ProgramId = new anchor.web3.PublicKey(
  "A1WQcJ7w8QPmyUmjUtfsvVMk47pCYcXSFf9hZq7mRwUF"
  ) 

  
  // const connection = new Connection('http://127.0.0.1:8899');


  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env()); 
  const program = anchor.workspace.Dapp011 as Program<Dapp011>;

  // variables
  const user = (program.provider as anchor.AnchorProvider).wallet; // initialise wallet
  const receiverKP = anchor.web3.Keypair.generate(); // initialise receiver

  let escrowPDA: anchor.web3.PublicKey
  let mint: anchor.web3.Keypair;
  let escrowTokenAddress: anchor.web3.PublicKey;
  let userATA: anchor.web3.PublicKey;
  let receiverATA: anchor.web3.PublicKey;
  let userStatsPDA: anchor.web3.PublicKey;

describe("dapp011", () => {
    before(async () => {

    // escrow wallet
    const [PDA, escrow_bump] = await PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("escrow"),
      user.publicKey.toBuffer(),
    ], 
    program.programId
    );

    console.log(escrow_bump)
    escrowPDA = PDA;
    
    // initialise mint address
    mint = anchor.web3.Keypair.generate()
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
    escrowTokenAddress = await getAssociatedTokenAddress(mint.publicKey, escrowPDA, true)

  })

  it("Trade Initialised", async () => {

    // create transaction
    const tx = await program.methods.initialiseTransaction(new anchor.BN(100))
    .accounts({
      initialiser: user.publicKey,
      receiver: receiverKP.publicKey,
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

    console.log(escrowPDA.toString())
    const DEBUG = await program.provider.connection.getParsedAccountInfo(escrowTokenAddress);
    console.log((DEBUG.value.data as ParsedAccountData).parsed);

    const DEBUG2 = await program.provider.connection.getParsedAccountInfo(escrowPDA);
    console.log("ESCROW OWNER:", DEBUG2.value.owner.toString());

    const escrowAccData = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow account", escrowAccData.amount.toNumber());
    console.log("escrow initialiser", escrowAccData.initialiser.toString());
    console.log("escrow receiver", escrowAccData.receiver.toString());
    console.log("escrow state", Object.keys(escrowAccData.state)[0]);
    console.log("escrow bump", escrowAccData.bump);
    assert.equal(escrowAccData.amount.toNumber(), 100, "escrow amount data is equal to expected");
    assert.isTrue(escrowAccData.initialiser.equals(user.publicKey), "escrow initialiser  is equal to expected");
    assert.isTrue(escrowAccData.receiver.equals(receiverKP.publicKey), "escrow receiver is equal to expected");
    assert.equal(Object.keys(escrowAccData.state)[0], 'initialised');

    const escrowATAData = await program.provider.connection.getParsedAccountInfo(escrowTokenAddress);
    console.log("escrow ATA:", escrowATAData.value.data.valueOf());


  });

  it("User Stats Initialised", async () => {
      
    // user stats wallet
    const [PDA, _] = await PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("user_stats"),
      user.publicKey.toBuffer(),
    ], 
    program.programId
    );

    console.log(PDA.toString())
    const tx = await program.methods.initialiseUser().accounts({
      initialiser: user.publicKey,
      userStats: PDA,
      SystemProgram: SystemProgram.programId
    })
    .rpc()

    const user_stats = await program.account.userStats.fetch(PDA);
    console.log("user stats", user_stats)

    userStatsPDA = PDA
  });
  
  it("Buyer Transfered", async () => {

    await wait(500);

    userATA = await getAssociatedTokenAddress(mint.publicKey, user.publicKey);

    const tx = new anchor.web3.Transaction().add( 
      createAssociatedTokenAccountInstruction(user.publicKey, userATA, user.publicKey, mint.publicKey)
    )
    .add( 
      createMintToInstruction(mint.publicKey, userATA, user.publicKey, 1000)
      );


    const signature = await program.provider.sendAndConfirm(tx);

    const escrowAccData = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow state before", Object.keys(escrowAccData.state)[0]);
    const userATABalance = await program.provider.connection.getTokenAccountBalance(userATA);
    console.log("user amount before", userATABalance.value.amount);  
    const escrowATABalance = await program.provider.connection.getTokenAccountBalance(escrowTokenAddress);
    console.log("escrow amount before", escrowATABalance.value.amount);

    const tx2 = await program.methods.buyerTransfer().accounts({
      initialiser: user.publicKey,
      mint: mint.publicKey,
      initialiserTokenAccount: userATA,
      escrow: escrowPDA,
      escrowTokenAccount: escrowTokenAddress,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

    const userATABalance2 = await program.provider.connection.getTokenAccountBalance(userATA);
    console.log("user amount after", userATABalance2.value.amount);  
    const escrowATABalance2 = await program.provider.connection.getTokenAccountBalance(escrowTokenAddress);
    console.log("escrow amount after", escrowATABalance2.value.amount);
    const escrowAccData2 = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow state after", Object.keys(escrowAccData2.state)[0]);

    const tx201 = await program.methods.sellerSent().accounts({
      receiver: receiverKP.publicKey,
      escrow: escrowPDA,
      SystemProgram: SystemProgram.programId
    })
    .signers([receiverKP])
    .rpc()

    const escrowAccData3 = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow state after seller sent", Object.keys(escrowAccData3.state)[0]);
    
    receiverATA = await getAssociatedTokenAddress(mint.publicKey, receiverKP.publicKey);
    
    const tx21 = new anchor.web3.Transaction().add( 
      createAssociatedTokenAccountInstruction(user.publicKey, receiverATA, receiverKP.publicKey, mint.publicKey)
    )
    
    const signature2 = await program.provider.sendAndConfirm(tx21);

    const tx3 = await program.methods.buyerReceived(false).accounts({
      initialiser: user.publicKey,
      receiver: receiverKP.publicKey,
      mint: mint.publicKey,
      receiverTokenAccount: receiverATA,
      escrowAcc: escrowPDA,
      escrowTokenAccount: escrowTokenAddress,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .rpc()
    
    const escrowAccData4 = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow state after seller sent", Object.keys(escrowAccData4.state)[0]);

    const receiverATABalance = await program.provider.connection.getTokenAccountBalance(receiverATA);
    console.log("receiver amount after", receiverATABalance.value.amount);  
    
  });
  
});

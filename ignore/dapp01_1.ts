import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Dapp011 } from "../target/types/dapp01_1";
import { SystemProgram, PublicKey, Signer } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createInitializeMintInstruction, TOKEN_2022_PROGRAM_ID, createMint } from "@solana/spl-token";
import { createMintToInstruction, createInitializeMint2Instruction,getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getMint } from '@solana/spl-token';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import KeyPair from "../tests/test_kp.json";
import User from "/root/.config/solana/id.json";

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// my program address

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


// Configure the client to use the local cluster.
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.Dapp011 as Program<Dapp011>;

const secretarray = Uint8Array.from(KeyPair);
const userarray = Uint8Array.from(User)

// variables
const userAsKeypair = Keypair.fromSecretKey(userarray);
const user = (program.provider as anchor.AnchorProvider).wallet; // initialise wallet
// anchor.setProvider(new anchor.AnchorProvider(connection, user, anchor.AnchorProvider.defaultOptions()));
const initialiserKP = anchor.web3.Keypair.generate() // initialise initialiser
const initialiserProgram = new Program(
  program.idl,
  program.programId,
  // new anchor.AnchorProvider(connection, new anchor.Wallet(initialiserKP), anchor.AnchorProvider.defaultOptions())
  new anchor.AnchorProvider(program.provider.connection, new anchor.Wallet(initialiserKP), anchor.AnchorProvider.defaultOptions())
  );
const receiverKP = anchor.web3.Keypair.generate(); // initialise receiver
const mint = anchor.web3.Keypair.generate(); // initialise mint address
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

const test_kp = anchor.web3.Keypair.generate()

describe("dapp011", () => {
  before("Initialise mint and fund", async () => {

    // initialise mint account
    const mint_tx = await createMint(
      program.provider.connection,
      userAsKeypair,
      user.publicKey,
      user.publicKey,
      0,
      mint
      );    
    
    // fund initialising keypair
    const tx1 = await program.provider.connection.requestAirdrop(initialiserKP.publicKey, 1*LAMPORTS_PER_SOL);
    // fund receiving keypair
    const tx2 = await program.provider.connection.requestAirdrop(receiverKP.publicKey, 1*LAMPORTS_PER_SOL);
    await wait(500);
    console.log("HERE")
    const txh = await program.provider.connection.requestAirdrop(test_kp.publicKey, 1*LAMPORTS_PER_SOL);

    // PDA for initialiser account
    //  seeds:
    //    "user_stats": string
    //    initialiser: pubkey
    const [PDA3, _bump3] = await PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("user_stats"),
      initialiserKP.publicKey.toBuffer(),
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

    initialiserStatsPDA = PDA3;
    receiverStatsPDA = PDA4;

    // send initialise_transaction instruction:
    //  arguments:
    //    none
    //  signers:
    //    initialiser
    // description:
    //  Initialise user stats account.
    const tx3 = await program.methods.initialiseUser().accounts({
      initialiser: initialiserKP.publicKey,
      userStats: initialiserStatsPDA,
      systemProgram: SystemProgram.programId
    })
    .signers([initialiserKP])
    .rpc();



    // send initialise_transaction instruction:
    //  arguments:
    //    none
    //  signers:
    //    receiver
    // description:
    //  Initialise user stats account.
    const tx4 = await program.methods.initialiseUser().accounts({
      initialiser: receiverKP.publicKey,
      userStats: receiverStatsPDA,
      systemProgram: SystemProgram.programId
    })
    .signers([receiverKP])
    .rpc();


    // initialiser associated token address
    initialiserATA = await getAssociatedTokenAddress(mint.publicKey, initialiserKP.publicKey);
    // receiver associated token address
    receiverATA = await getAssociatedTokenAddress(mint.publicKey, receiverKP.publicKey);

    // send transaction to create atas for given accounts.
    const tx5 = new anchor.web3.Transaction().add( 
      createAssociatedTokenAccountInstruction(user.publicKey, initialiserATA, initialiserKP.publicKey, mint.publicKey)
    )
    .add( 
      createAssociatedTokenAccountInstruction(user.publicKey, receiverATA, receiverKP.publicKey, mint.publicKey)
    )
    .add( 
      createMintToInstruction(mint.publicKey, initialiserATA, user.publicKey, 1000)
    );
      
    const signature = await program.provider.sendAndConfirm(tx5);
  })


  beforeEach("Initialise accounts", async () => {
    //////////////////////
    //FIND PDA ADDRESSES//
    //////////////////////

    // create listing arguments to send to listing account - in listing structure format.
    // listing_identifier = new anchor.BN(getRandomInt(1000));
    listing_identifier = new anchor.BN(4);

    const mykp = new anchor.web3.PublicKey("8PicuETn3oTfcv1JQzxszzD4A4ecsqz3NdJKpYXmW8VJ")
    // const testkey = new anchor.web3.PublicKey("8PicuETn3oTfcv1JQzxszzD4A4ecsqz3NdJKpYXmW8VJ")
    // PDA for listing account
    //  seeds:
    //    receiver: pubkey
    //    semi-unique identifier: u64
    const [PDA1, bump1] = PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("listing"),
      mykp.toBuffer(),
      listing_identifier.toBuffer("le", 8)
    ], 
    program.programId
    );

    console.log(PDA1.toString(), bump1.valueOf())
    // console.log(listing_identifier, bump1, PDA1.toString());
    listing_args = {
      bump: bump1,
      price: new anchor.BN(100),
      identifier: listing_identifier,
      name: "jacket",
      itemType: {jacket:{}} ,
      colour: {blue:{}} ,
      condition: {tag: {new:{} }, conditionMap: [{isMajor: true, isFront: true, xPos: 1, yPos: 1}]},
      seller: test_kp.publicKey,
      saleState: {forSale:{}}
    };
    // listing_args = {
    //   bump: bump1,
    //   price: new anchor.BN(100),
    //   identifier: listing_identifier,
    //   name: "jacket",
    //   itemType: {jacket:{}} as never,
    //   colour: {blue:{}} as never,
    //   condition: {tag: {new:{} as never}, conditionMap: [{isMajor: true, isFront: true, xPos: 1, yPos: 1}]},
    //   seller: receiverKP.publicKey,
    //   saleState: {forSale:{}} as never
    // };

    listingpda = PDA1;

    // PDA for escrow account
    //  seeds:
    //    "escrow": string
    //    initialiser: pubkey
    //    listing pda: pubkey
    const [PDA2, _bump2] = PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode("escrow"),
      initialiserKP.publicKey.toBuffer(),
      listingpda.toBuffer()
    ],      
    program.programId
    );

    escrowPDA = PDA2;

    // escrow associated token address
    escrowATA = await getAssociatedTokenAddress(mint.publicKey, escrowPDA, true)


    ///////////////////////
    //INITIALISE ACCOUNTS//
    ///////////////////////

    // send create_listing instruction:
    //  arguments:
    //    Listing struct (see rust)
    //  signers:
    //    receiver
    // description:
    //  Create a listing PDA account associated with the intialiser.
    const tx1 = await program.methods.createListing(listing_args).accounts({
      initialiser: user.publicKey,
      userListing: listingpda,
      systemProgram: SystemProgram.programId
    })
    // .signers([test_kp])
    .rpc();
    
    console.log("HERE")

    // // fetch listing account data
    // const pdadata = await program.account.listing.fetch(listingpda);
    // console.log(pdadata);

    // send initialise_transaction instruction:
    //  arguments:
    //    none
    //  signers:
    //    initialiser
    // description:
    //  Initialise a transaction between a buyer and a seller, creates all associated accounts:
    //    escrow pda
    //    escrow ata
    //    initialiser ata
    //    receiver ata
    const tx2 = await program.methods.initialiseTransaction(new anchor.BN(100))
    .accounts({
      initialiser: initialiserKP.publicKey,
      receiver: receiverKP.publicKey,
      escrowAcc: escrowPDA,
      listing: listingpda,
      tokenAccount: escrowATA,
      mint: mint.publicKey,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY
    })
    .signers([initialiserKP])
    .rpc();

    // const DEBUG = await program.provider.connection.getParsedAccountInfo(escrowATA);
    // console.log((DEBUG.value.data as ParsedAccountData).parsed);

    // fetch escrow pda data
    const escrowAccData = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow address:", escrowPDA.toString());
    console.log("listing address:", listingpda.toString());
    console.log("escrow: listing amount", escrowAccData.amount.toNumber());
    console.log("escrow: state", Object.keys(escrowAccData.state)[0]);

    const tx6 = await initialiserProgram.methods.buyerTransfer().accounts({
      initialiser: initialiserKP.publicKey,
      mint: mint.publicKey,
      initialiserTokenAccount: initialiserATA,
      escrow: escrowPDA,
      escrowTokenAccount: escrowATA,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
 //   .signers([initialiserKP])
    .rpc();

    console.log(" ////////////////////////\n","//ACCOUNTS INITIALISED//\n","////////////////////////")

    program.methods.buyerTransfer()
  })
  
  it("timeout: seller didn't respond", async () => {
    
    /////////////////////////////////
    //TIMEOUT IF NO SELLER RESPONSE//
    /////////////////////////////////

    const escrowAccData = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow: state", Object.keys(escrowAccData.state)[0]);
    const initialiserATAData = await program.provider.connection.getTokenAccountBalance(initialiserATA);
    console.log("initialiser account balance before timeout:", initialiserATAData.value.amount)

    const tx = await program.methods.timeoutbs().accounts({
      initialiser: initialiserKP.publicKey,
      mint: mint.publicKey,
      escrowAcc: escrowPDA,
      escrowTokenAccount: escrowATA,
      initiaterStats: initialiserStatsPDA,
      initialiserTokenAccount: initialiserATA,
      receiverStats: receiverStatsPDA,  
      systemAuthority: dispute_authority.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID
    })
    .signers([dispute_authority])
    .rpc();

    const tx2 = await program.methods.closeListing(listing_identifier).accounts({
      escrowAcc: escrowPDA,
      userListing: listingpda,
      receiver: receiverKP.publicKey,
      systemAuthority: dispute_authority.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([dispute_authority])
    .rpc();

    const escrowAccData2 = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow: state", Object.keys(escrowAccData2.state)[0]);
    const initialiserATAData2 = await program.provider.connection.getTokenAccountBalance(initialiserATA);
    console.log("initialiser account balance after timeout:", initialiserATAData2.value.amount)

    console.log(" ///////////////////////\n","//TIMEOUT SUCCESSFULL//\n","///////////////////////")

  })  

  it("timeout: buyer didn't respond", async () => {

    /////////////////////////////////
    //TIMEOUT IF NO BUYER RESPONSE//
    /////////////////////////////////

    const escrowAccData = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow: state", Object.keys(escrowAccData.state)[0]);
    const receiverATAData = await program.provider.connection.getTokenAccountBalance(receiverATA);
    console.log("receiver account balance before timeout:", receiverATAData.value.amount)

    const tx1 = await program.methods.sellerSent().accounts({
      receiver: receiverKP.publicKey,
      escrow: escrowPDA,
      systemProgram: SystemProgram.programId
    })
    .signers([receiverKP])
    .rpc()

    const escrowAccData2 = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow: state", Object.keys(escrowAccData2.state)[0]);

    const tx = await program.methods.timeoutss().accounts({
      initialiser: initialiserKP.publicKey,
      mint: mint.publicKey,
      escrowAcc: escrowPDA,
      escrowTokenAccount: escrowATA,
      receiverTokenAccount: receiverATA,
      initiaterStats: initialiserStatsPDA,
      receiver: receiverKP.publicKey,
      receiverStats: receiverStatsPDA,  
      systemAuthority: dispute_authority.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID
    })
    .signers([dispute_authority])
    .rpc();

    const tx2 = await program.methods.closeListing(listing_identifier).accounts({
      escrowAcc: escrowPDA,
      userListing: listingpda,
      receiver: receiverKP.publicKey,
      systemAuthority: dispute_authority.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([dispute_authority])
    .rpc();

    const escrowAccData3 = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow: state", Object.keys(escrowAccData3.state)[0]);
    const receiverATAData2 = await program.provider.connection.getTokenAccountBalance(receiverATA);
    console.log("receiver account balance after timeout:", receiverATAData2.value.amount)

    console.log(" ///////////////////////\n","//TIMEOUT SUCCESSFULL//\n","///////////////////////")
  })
  it("trade successful", async () => {

    ////////////////////
    //SUCCESSFUL TRADE//
    ////////////////////

    const escrowAccData = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow state:", Object.keys(escrowAccData.state)[0]);
    const escrowATAData = await program.provider.connection.getTokenAccountBalance(escrowATA);
    console.log("escrow account balance during trade:", escrowATAData.value.amount);
    const initialiserATAData = await program.provider.connection.getTokenAccountBalance(initialiserATA);
    console.log("initialiser account balance during trade:", initialiserATAData.value.amount);
    const receiverATAData = await program.provider.connection.getTokenAccountBalance(receiverATA);
    console.log("receiver account balance during trade:", receiverATAData.value.amount);

    const tx1 = await program.methods.sellerSent().accounts({
      receiver: receiverKP.publicKey,
      escrow: escrowPDA,
      systemProgram: SystemProgram.programId
    })
    .signers([receiverKP])
    .rpc()

    const escrowAccData2 = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow state:", Object.keys(escrowAccData2.state)[0]);

    const tx2 = await program.methods.buyerReceived(false).accounts({
      initialiser: initialiserKP.publicKey,
      receiver: receiverKP.publicKey,
      mint: mint.publicKey,
      listing: listingpda, 
      receiverTokenAccount: receiverATA,
      escrowAcc: escrowPDA,
      escrowTokenAccount: escrowATA,
      initiaterStats: initialiserStatsPDA,
      receiverStats: receiverStatsPDA,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .signers([initialiserKP])
    .rpc()

  
    const escrowAccData3 = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow state:", Object.keys(escrowAccData3.state)[0]);
    const initialiserATAData2 = await program.provider.connection.getTokenAccountBalance(initialiserATA);
    console.log("initialiser account balance after trade:", initialiserATAData2.value.amount);
    const receiverATAData2 = await program.provider.connection.getTokenAccountBalance(receiverATA);
    console.log("receiver account balance after trade:", receiverATAData2.value.amount);  

    console.log(" ////////////////////\n","//TRADE SUCCESSFUL//\n","////////////////////")
  
  })
it("to dispute", async () => {
    ////////////////////
    //TRADE TO DISPUTE//
    ////////////////////

    const escrowAccData = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow state:", Object.keys(escrowAccData.state)[0]);
    const escrowATAData = await program.provider.connection.getTokenAccountBalance(escrowATA);
    console.log("escrow account balance during trade:", escrowATAData.value.amount);
    const initialiserATAData = await program.provider.connection.getTokenAccountBalance(initialiserATA);
    console.log("initialiser account balance during trade:", initialiserATAData.value.amount);
    const receiverATAData = await program.provider.connection.getTokenAccountBalance(receiverATA);
    console.log("receiver account balance during trade:", receiverATAData.value.amount);

    const tx1 = await program.methods.sellerSent().accounts({
      receiver: receiverKP.publicKey,
      escrow: escrowPDA,
      systemProgram: SystemProgram.programId
    })
    .signers([receiverKP])
    .rpc()

    const escrowAccData2 = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow state:", Object.keys(escrowAccData2.state)[0]);

    const tx2 = await program.methods.buyerReceived(true).accounts({
      initialiser: initialiserKP.publicKey,
      receiver: receiverKP.publicKey,
      mint: mint.publicKey,
      listing: listingpda, 
      receiverTokenAccount: receiverATA,
      escrowAcc: escrowPDA,
      escrowTokenAccount: escrowATA,
      initiaterStats: initialiserStatsPDA,
      receiverStats: receiverStatsPDA,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .signers([initialiserKP])
    .rpc()

    const escrowAccData3 = await program.account.escrow.fetch(escrowPDA);
    console.log("escrow state:", Object.keys(escrowAccData3.state)[0]);
  
  
    const tx6 = await program.methods.settleReceiver(new anchor.BN(77)).accounts({
      receiver: receiverKP.publicKey,
      receiverTokenAccount: receiverATA,
      receiverStats: receiverStatsPDA, 
      escrowAcc: escrowPDA,
      escrowTokenAccount: escrowATA,
      disputeAuthority: dispute_authority.publicKey,
      mint: mint.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .signers([dispute_authority])
    .rpc();

    const tx5 = await program.methods.settleInitialiser(new anchor.BN(23)).accounts({
      initialiser: initialiserKP.publicKey,
      initialiserTokenAccount: initialiserATA,
      initiaterStats: initialiserStatsPDA, 
      escrowAcc: escrowPDA,
      escrowTokenAccount: escrowATA,
      disputeAuthority: dispute_authority.publicKey,
      mint: mint.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .signers([dispute_authority])
    .rpc();


    const initialiserATAData2 = await program.provider.connection.getTokenAccountBalance(initialiserATA);
    console.log("initialiser account balance after trade:", initialiserATAData2.value.amount);
    const receiverATAData2 = await program.provider.connection.getTokenAccountBalance(receiverATA);
    console.log("receiver account balance after trade:", receiverATAData2.value.amount);  

    console.log(" ////////////////////\n","//TRADE TO DISPUTE//\n","////////////////////")
  })

});

import type { Program, Idl } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { SystemProgram, PublicKey } from "@solana/web3.js";
import { 
    getAssociatedTokenAddress, createAssociatedTokenAccountInstruction,
    createMintToInstruction, ASSOCIATED_TOKEN_PROGRAM_ID
 } from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import type { Listing } from "../lib/helpers/listingtype";

interface ButtonProps {
    program: Program<Idl> | undefined
}

interface TokenButtonProps extends ButtonProps {
    accounts: {
        mint: PublicKey,
        account: PublicKey | undefined
    },
    amount: number
}

export const FundTokenAccount = ({ program, accounts, amount }: TokenButtonProps) => {
    
    async function handleClick() {
        if (!program || !accounts.account) return;

        try {
            const ATA = await getAssociatedTokenAddress(accounts.mint, accounts.account);

            const tx = new anchor.web3.Transaction()
            .add( 
                createAssociatedTokenAccountInstruction(program.provider.publicKey, ATA, accounts.account, accounts.mint))
            .add(
                createMintToInstruction(accounts.mint, ATA, program.provider.publicKey, amount));
        
            const signature = await program.provider.sendAndConfirm(tx);

            console.log(signature)
            console.log(`Tokens sent to ${ATA.toString()}`);
        } catch(err) {
            console.log("Error: ", err);
        }
    }

    const isDisabled = !program ? true: false
    return <button disabled={isDisabled} onClick={handleClick}>Transfer 100 tokens</button>
}

export const InitialiseUserButton = ({ program }: ButtonProps) => {

    async function handleClick() {
        if (!program) return;

        const pubkey = program.provider.publicKey as PublicKey
        const res = await fetch('/api/accounts/'+program.provider.publicKey?.toString());
        const data = await res.json();
        
        console.log(data.isInitialised);
        
        if(data.isInitialised) {
            return;
        }

        const [statsPDA, _bump] = PublicKey.findProgramAddressSync([
            anchor.utils.bytes.utf8.encode("user_stats"),
            pubkey.toBuffer(),
          ], 
          program.programId
          );

        try {
            const tx = await program.methods
            .initialiseUser()
            .accounts({
                initialiser: pubkey,
                userStats: statsPDA,
                systemProgram: SystemProgram.programId
            })
            .rpc();

            console.log(tx)
            console.log(`Account initialised at ${statsPDA}`);

        } catch(err) {
            console.log("Error: ", err);
        }       
    }

    const isDisabled = !program ? true: false
    return <button disabled={isDisabled} onClick={handleClick}>Initialise User</button>
}

// interface ListingButtonProps extends ButtonProps {
//     listingArgs: Listing,
// }

// export const CreateListingButton = ({ program, listingArgs }: ListingButtonProps) => {

//     async function handleClick() {
//         if (!program) return;

//         const pubkey = program.provider.publicKey as PublicKey
//         const res = await fetch('/api/accounts/'+program.provider.publicKey?.toString());
//         const data = await res.json();
        
//         console.log(data.isInitialised);
        
//         if(data.isInitialised) {
//             return;
//         }

//         const [statsPDA, _bump] = PublicKey.findProgramAddressSync([
//             anchor.utils.bytes.utf8.encode("user_stats"),
//             pubkey.toBuffer(),
//           ], 
//           program.programId
//           );

//         try {
//             const tx = await program.methods
//             .initialiseUser()
//             .accounts({
//                 initialiser: pubkey,
//                 userStats: statsPDA,
//                 systemProgram: SystemProgram.programId
//             })
//             .rpc();

//             console.log(tx)
//             console.log(`Account initialised at ${statsPDA}`);

//         } catch(err) {
//             console.log("Error: ", err);
//         }       
//     }

//     const isDisabled = !program ? true: false
//     return <button disabled={isDisabled} onClick={handleClick}>Initialise User</button>
// }

interface InitiateTradeProps extends ButtonProps {
    account: PublicKey,
    id: number,
    amount: number,
}

export const InitiateTradeButton = ({program, account, id, amount}: InitiateTradeProps) => {

    async function handleClick() {
        if (!program) return;

        // hardcode mint for now
        const mint = new PublicKey("2hiumqn5Qmr18AjmMNkbbmzYXAVsBt8EPM2AkyjmhiXQ");

        const listing_id = new anchor.BN(id);
        const [PDA1, _bump1] = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("listing"),
                account.toBuffer(),
                listing_id.toArrayLike(Buffer, "le", 8)
            ], 
            program.programId
        );

        const [PDA2, _bump2] = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("escrow"),
                program.provider.publicKey.toBuffer(),
                PDA1.toBuffer()
            ],      
            program.programId
        );

        const escrowATA = await getAssociatedTokenAddress(mint, PDA2, true);
        const providerATA = await getAssociatedTokenAddress(mint, program.provider.publicKey);

        const acc = await program.account.listing.fetch(PDA1);
        console.log(acc)

        try {
            const tx = await program.methods.initialiseTransaction(new anchor.BN(amount))
            .accounts({
            initialiser: program.provider.publicKey,
            receiver: account,
            escrowAcc: PDA2,
            listing: PDA1,
            tokenAccount: escrowATA,
            mint: mint,
            systemProgram: SystemProgram.programId,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY
            })
            .rpc();


            console.log(PDA2.toString());
            console.log(tx);
        } catch(err) {
            console.log("Error: ", err);
        }

        try{
            const tx = await program.methods.buyerTransfer().accounts({
                initialiser: program.provider.publicKey,
                mint: mint,
                initialiserTokenAccount: providerATA,
                escrow: PDA2,
                escrowTokenAccount: escrowATA,
                systemProgram: SystemProgram.programId,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

            console.log("buyer transfered");
            console.log(tx);
        } catch(err) {
            console.log("Error: ", err)
        }
    }

    const isDisabled = !program ? true: false
    return <button onClick={handleClick} disabled={isDisabled}>Buy now</button>

}

interface ItemSentProps extends ButtonProps {
    escrow: PublicKey
}

export const ItemSentButton = ({program, escrow}: ItemSentProps) => {
    async function handleClick() {
        if (!program) return;

        const escrowacc = await program.account.escrow.fetch(escrow)
        const seller: PublicKey = escrowacc.receiver
        
        if (!seller.equals(program.provider.publicKey)) {
            return new Error("Account does not match seller on the escrow");
        };
        
        const tx = await program.methods.sellerSent().accounts({
            receiver: seller,
            escrow: escrow,
            systemProgram: SystemProgram.programId
        })
        .rpc()

        console.log(tx)
      
    }

    const isDisabled = !program ? true: false
    return <button onClick={handleClick} disabled={isDisabled}>Item sent</button>;
}

interface BuyerReceivedProps extends ButtonProps {
    escrow: PublicKey,
    mint: PublicKey,    
    toDispute: boolean
}

export const BuyerReceivedButton = ({program, escrow, mint, toDispute}: BuyerReceivedProps) => {
    async function handleClick() {
        if (!program) return;

        const escrowacc = await program.account.escrow.fetch(escrow);
        const buyer: PublicKey = escrowacc.initialiser;
        const seller: PublicKey = escrowacc.receiver;

        const sellerATA = await getAssociatedTokenAddress(mint, seller);
        const escrowATA = await getAssociatedTokenAddress(mint, escrow, true);

        const [sellerStats, _bump1] = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("user_stats"),
                seller.toBuffer(),
            ], 
            program.programId
        );
        
        const [buyerStats, _bump2] = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("user_stats"),
                buyer.toBuffer(),
            ], 
            program.programId
        );

        if (!buyer.equals(program.provider.publicKey)) {
            return new Error("Account does not match buyer on the escrow");
        };
        
        const tx = await program.methods.buyerReceived(toDispute).accounts({
            initialiser: buyer,
            receiver: seller,
            mint: mint,
            listing: escrowacc.listing, 
            receiverTokenAccount: sellerATA,
            escrowAcc: escrow,
            escrowTokenAccount: escrowATA,
            initiaterStats: buyerStats,
            receiverStats: sellerStats,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .rpc();

        console.log(tx)
      
    }

    const isDisabled = !program ? true: false
    return <button onClick={handleClick} disabled={isDisabled}>Happy and received items</button>;
}

export const Testbutton = ({program}: ButtonProps) => {
 
    const handleClick = async () => {
        const escrow = await program?.account.escrow.fetch(new PublicKey("HDoTn44V1onEf8yxVe2HKNdLVEP1uYRzcNW6cN8R9uTm"));
        console.log(escrow)
    }
    return <button onClick={handleClick}>Click me</button>
}
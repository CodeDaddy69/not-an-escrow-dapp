import { useState } from "react";
import type { Program, Idl } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { START_DATE } from "../lib/helpers/date_start";

interface ListingProps {
    program: Program<Idl> | undefined
}

export const ListingForm = ({ program }: ListingProps) => {

    const handleSubmit = async (e) => {

        if (!program) return;

        e.preventDefault();

        const listing_identifier = new anchor.BN(Date.now() - START_DATE);
        console.log(listing_identifier.toNumber());
        const [PDA, bump] = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("listing"),
                program.provider.publicKey.toBuffer(),
                listing_identifier.toArrayLike(Buffer, "le", 8)
            ], 
            program.programId
        );
        console.log(bump);
        // dont touch this with a 10ft barge pole, it breaks so easily and it nearly made me cry
        let listing_args = {
            bump: bump,
            price: new anchor.BN(Number(price)),
            identifier: listing_identifier,
            name: name,
            itemType: {jacket:{}} ,
            colour: {blue:{}} ,
            condition: {tag: {new:{} }, conditionMap: [{isMajor: true, isFront: true, xPos: 1, yPos: 1}]},
            seller: program.provider.publicKey,
            saleState: {forSale:{}}
          };


        const tx = await program.methods.createListing(listing_args).accounts({
            initialiser: program.provider.publicKey,
            userListing: PDA,
            systemProgram: SystemProgram.programId
        })
        .rpc();

        console.log(tx);
        console.log(`Listing created at ${PDA.toString()}`);
    }

    const [name, setName] = useState("")
    const [price, setPrice] = useState("0")

    const isDisabled = !program ? true: false

    return <form onSubmit={handleSubmit}>
        <label>Listing name:</label>
        <input type="text"
        required
        value = {name}
        onChange={(e) => setName(e.target.value)}
        />
        <label>Listing price:</label>
        <input type="number"
        required
        value = {price}
        onChange={(e) => setPrice(e.target.value)}
        />
        <button disabled={isDisabled} >Create listing</button>
        </form>
}
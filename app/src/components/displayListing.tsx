import Listings from "../../data/listings.json";
import type { Program, Idl } from "@coral-xyz/anchor";
import { InitiateTradeButton } from "./buttons";
import { PublicKey } from "@solana/web3.js";

interface GetListingProps {
    program: Program<Idl> | undefined,
    account: string,
    id: number
}

export const DisplayListing = ({program, account, id}: GetListingProps) => {
    let listings = Listings.filter((x) => {return x.account === account && x.identifier === id})

    let listing = listings[0]

    if (!listing) return <div>No listing found</div>;

    return <div>
        <div>
            <h3>{listing.listing.name} ${listing.listing.price}</h3>
            <h4>item details</h4>
            <p>
                {`${Object.keys(listing.listing.itemType)} ${Object.keys(listing.listing.colour)} ${Object.keys(listing.listing.condition.tag)}`}
            </p>
            <InitiateTradeButton 
            program={program}
            account={new PublicKey(account)}
            id={id}
            amount={listing.listing.price}
            />
        </div>
    </div>
}
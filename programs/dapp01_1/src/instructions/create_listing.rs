use anchor_lang::prelude::*;
use crate::state::Listing;

#[derive(Accounts)]
#[instruction(listing_args: Listing)]
pub struct InitialiseListing<'info> {
    #[account(
        init,
        payer = initialiser,
        // anchor_disc: 8, bump: 1, price: 8, identifier: 8, name: 4 + 50, item_type: 1, colour: 1, condition: (1 + 4 + 8* 4), seller: 32, sale state: 1 
        space = 8 + 1 + 8 + 8 + 54 + 1 + 1 + 37 + 32 + 1,
        seeds = ["listing".as_bytes(), initialiser.key().as_ref(), &listing_args.identifier.to_le_bytes()],
        bump
    )]
    pub user_listing: Account<'info, Listing>,
    #[account(mut)]
    pub initialiser: Signer<'info>,
    pub system_program: Program<'info, System>
}

pub fn initialise_listing_handler(ctx: Context<InitialiseListing>, listing_args: Listing) -> Result<()> {
    ctx.accounts.user_listing.set_inner(listing_args);
    Ok(())
}
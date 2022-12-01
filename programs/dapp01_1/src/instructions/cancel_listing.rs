use anchor_lang::prelude::*;
use crate::state::Listing;

#[derive(Accounts)]
#[instruction(identifier: u64)]
pub struct CancelListing<'info> {
    #[account(
        mut,
        constraint = user_listing.seller == initialiser.key(),
        close = initialiser,
        seeds = ["listing".as_bytes(), initialiser.key().as_ref(), &identifier.to_le_bytes()],
        bump
    )]
    pub user_listing: Account<'info, Listing>,
    #[account(mut)]
    pub initialiser: Signer<'info>,
    pub system_program: Program<'info, System>
}

pub fn cancel_listing_handler(ctx: Context<CancelListing>, identifier: u64) -> Result<()> {
    Ok(())
}
use anchor_lang::prelude::*;
use crate::state::{Escrow, Listing, TransState};
use crate::CustomError;

#[derive(Accounts)]
#[instruction(identifier: u64)]
pub struct CloseListing<'info> {
    #[account(
        mut,
        constraint = user_listing.seller == receiver.key(),
        close = receiver,
        seeds = ["listing".as_bytes(), receiver.key().as_ref(), &identifier.to_le_bytes()],
        bump
    )]
    pub user_listing: Account<'info, Listing>,
    #[account(
        constraint = escrow_acc.state == TransState::Timeout @ CustomError::WrongState,
        constraint = escrow_acc.receiver == receiver.key() @ CustomError::WrongAccount,
        constraint = escrow_acc.listing == user_listing.key() @ CustomError::WrongListing,
    )]
    pub escrow_acc: Account<'info, Escrow>,
    #[account(mut)]
    pub receiver: SystemAccount<'info>,
    #[account(
        mut,
        constraint = system_authority.key() == crate::state::dispute_address::ID @ CustomError::WrongDisputeAddress
    )]
    pub system_authority: Signer<'info>,
    pub system_program: Program<'info, System>
}

pub fn close_listing_handler(ctx: Context<CloseListing>, identifier: u64) -> Result<()> {
    Ok(())
}

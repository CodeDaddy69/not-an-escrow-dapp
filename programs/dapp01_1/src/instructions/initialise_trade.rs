use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
//    mint,
    token::{TokenAccount, Mint, Token}
};

use crate::state::{TransState, Escrow, Listing, SaleState};
use crate::CustomError;

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct InitialiseTransaction<'info> {
    #[account(mut)]
    pub initialiser: Signer<'info>,
    #[account(
        init,
        payer = initialiser,
        space = 8 + 32 + 32 + 8 + 1 + 1 + 32 + 1,
        seeds = ["escrow".as_bytes(), initialiser.key().as_ref(), listing.key().as_ref()],
        bump
    )]
    pub escrow_acc: Account<'info, Escrow>,
    /// CHECK: not signer here
    pub receiver: UncheckedAccount<'info>,
    #[account(
        init,
        payer = initialiser,
        associated_token::mint = mint,
        associated_token::authority = escrow_acc
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = listing.seller == receiver.key() @ CustomError::WrongListing,
        constraint = listing.price == amount @ CustomError::WrongAmount
    )]
    pub listing: Account<'info, Listing>,
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>
}

pub fn initialise_transaction_handler(ctx: Context<InitialiseTransaction>, amount: u64) -> Result<()> {
    let escrow_acc = &mut ctx.accounts.escrow_acc;
    escrow_acc.initialiser = ctx.accounts.initialiser.key();
    escrow_acc.receiver = ctx.accounts.receiver.key();
    escrow_acc.amount = amount;
    escrow_acc.state = TransState::Initialised;
    escrow_acc.bump = [*ctx.bumps.get("escrow_acc").unwrap()];
    escrow_acc.listing = ctx.accounts.listing.key();
    escrow_acc.has_rrecived = false;

    let listing = &mut ctx.accounts.listing;
    listing.sale_state = SaleState::Sold;
    Ok(())
}
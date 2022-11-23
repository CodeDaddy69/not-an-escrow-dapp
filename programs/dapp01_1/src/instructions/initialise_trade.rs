use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    mint,
    token::{TokenAccount, Mint, Token}
};


// declare_id!("A1WQcJ7w8QPmyUmjUtfsvVMk47pCYcXSFf9hZq7mRwUF");

use crate::state::{TransState, Escrow};

#[derive(Accounts)]
pub struct InitialiseTransaction<'info> {
    #[account(mut)]
    pub initialiser: Signer<'info>,
    #[account(
        init,
        payer = initialiser,
        space = 8 + 32 + 32 + 8 + 1,
        seeds = ["escrow".as_bytes(), initialiser.key().as_ref()],
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
    Ok(())
}
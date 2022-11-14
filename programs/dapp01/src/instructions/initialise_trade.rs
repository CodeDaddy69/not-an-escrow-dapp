use anchor_lang::prelude::*;

use crate::state::Escrow;

#[derive(Accounts)]
pub struct InitialiseTransaction<'info> {
    #[account(mut)]
    pub initialiser: Signer<'info>,
    #[account(
        init,
        payer = initialiser,
        space = 8 + 32 + 32 + 8,
        seeds = ["escrow".as_bytes(), initialiser.key().as_ref()],
        bump
    )]
    pub escrow_acc: Account<'info, Escrow>,
    // test test
    pub receiver: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>
}

pub fn initialise_transaction_handler(ctx: Context<InitialiseTransaction>, amount: u64) -> Result<()> {
    let escrow_acc = &mut ctx.accounts.escrow_acc;
    escrow_acc.initialiser = ctx.accounts.initialiser.key();
    escrow_acc.receiver = ctx.accounts.receiver.key();
    escrow_acc.amount = amount;
    Ok(())
}
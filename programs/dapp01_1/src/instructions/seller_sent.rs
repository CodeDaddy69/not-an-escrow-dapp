use anchor_lang::prelude::*;

use crate::state::{TransState, Escrow};
use crate::CustomError;

#[derive(Accounts)]
pub struct SellerConfirmed<'info> {
    #[account(
        mut,
        constraint = escrow.receiver == *receiver.key @ CustomError::WrongAccount
    )]
    pub receiver: Signer<'info>,
    #[account(
        mut,
        constraint = escrow.state == TransState::BuyerSent @ CustomError::WrongState
    )]
    pub escrow: Account<'info, Escrow>,
    pub system_program: Program<'info, System>,
}

pub fn seller_sent_handler(ctx: Context<SellerConfirmed>) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    escrow.state = TransState::SellerSent;
    Ok(())
}
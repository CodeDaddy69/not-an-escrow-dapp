use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{
    Transfer,
    TokenAccount,
    Token,
    Mint,
    CloseAccount
}};
use crate::state::{TransState, Escrow, UserStats};
use crate::CustomError;
//use std::str::FromStr;

#[derive(Accounts)]
pub struct SettleDispute<'info> {
    /// CHECK: ...
    #[account(
        mut,
        constraint = initialiser.key == &escrow_acc.initialiser @ CustomError::WrongAccount
    )]
    pub initialiser: UncheckedAccount<'info>,
    /// CHECK: ...
    #[account(
        mut,
        constraint = receiver.key == &escrow_acc.receiver @ CustomError::WrongAccount
    )]
    pub receiver: UncheckedAccount<'info>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = escrow_acc.initialiser,
    )]
    pub initialiser_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = escrow_acc.receiver,
    )]
    pub receiver_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = ["user_stats".as_bytes(), initialiser.key().as_ref()],
        bump
    )]
    pub initiater_stats: Account<'info, UserStats>,
    #[account(
        mut,
        seeds = ["user_stats".as_bytes(), receiver.key().as_ref()],
        bump
    )]
    pub receiver_stats: Account<'info, UserStats>,
    #[account(
        mut,
        constraint = escrow_acc.state == TransState::Dispute @ CustomError::WrongState,
    )]
    pub escrow_acc: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = escrow_acc
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    /// CHECK: authority entered matches the hardcoded dispute address
    #[account(
        mut,
        constraint = dispute_authority.key == &Pubkey::new("111111111110111111111111111111111".as_bytes()) @ CustomError::WrongDisputeAddress
    )]
    pub dispute_authority: Signer<'info>,
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> SettleDispute<'info> {
    pub fn close_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = CloseAccount {
            account: self.escrow_token_account.to_account_info(),
            destination: self.initialiser.to_account_info(),
            authority: self.escrow_acc.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
    pub fn transfer_initialiser_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = Transfer {
            from: self.escrow_token_account.to_account_info(),
            to: self.initialiser_token_account.to_account_info(),
            authority: self.escrow_acc.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn transfer_receiver_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = Transfer {
            from: self.escrow_token_account.to_account_info(),
            to: self.receiver_token_account.to_account_info(),
            authority: self.escrow_acc.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn dispute_settled_handler(
    ctx: Context<SettleDispute>,  
    initialiser_amount: u64,
    receiver_amount: u64,
) -> Result<()> {
    Ok(())
}
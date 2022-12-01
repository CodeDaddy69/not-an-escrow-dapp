use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{
    self,
    Transfer,
    TokenAccount,
    Token,
    Mint,
    CloseAccount
}};
use crate::state::{TransState, Escrow, UserStats};
use crate::CustomError;

#[derive(Accounts)]
pub struct TimeoutBS<'info> {
    #[account(
        mut,
        constraint = initialiser.key() == escrow_acc.initialiser @ CustomError::WrongAccount
    )]
    /// CHECK: not signer here
    pub initialiser: SystemAccount<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = initialiser,
    )]
    pub initialiser_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = escrow_acc.state == TransState::BuyerSent @ CustomError::WrongState
    )]
    pub escrow_acc: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = escrow_acc
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = ["user_stats".as_bytes(), escrow_acc.initialiser.key().as_ref()],
        bump
    )]
    pub initiater_stats: Account<'info, UserStats>,
    #[account(
        mut,
        seeds = ["user_stats".as_bytes(), escrow_acc.receiver.key().as_ref()],
        bump
    )]
    pub receiver_stats: Account<'info, UserStats>,
    pub system_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> TimeoutBS<'info> {
    pub fn close_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = CloseAccount {
            account: self.escrow_token_account.to_account_info(),
            destination: self.initialiser.to_account_info(),
            authority: self.escrow_acc.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
    pub fn initialiser_transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = Transfer {
            from: self.escrow_token_account.to_account_info(),
            to: self.initialiser_token_account.to_account_info(),
            authority: self.escrow_acc.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn timeoutbs_handler(ctx: Context<TimeoutBS>) -> Result<()> {
    
    token::transfer(
        ctx.accounts.initialiser_transfer_ctx().with_signer(&[&ctx.accounts.escrow_acc.as_seeds()]),
        ctx.accounts.escrow_acc.amount
    )?;

    token::close_account(ctx.accounts.close_account_ctx().with_signer(&[&ctx.accounts.escrow_acc.as_seeds()]))?;

    let escrow = &mut ctx.accounts.escrow_acc;
    escrow.state = TransState::Timeout;
    
    Ok(())
}
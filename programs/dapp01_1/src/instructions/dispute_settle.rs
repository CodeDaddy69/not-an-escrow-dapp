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
//use std::str::FromStr;

#[derive(Accounts)]
pub struct SettleInitialiser<'info> {
    /// CHECK: ...
    #[account(
        mut,
        constraint = initialiser.key == &escrow_acc.initialiser @ CustomError::WrongAccount
    )]
    pub initialiser: UncheckedAccount<'info>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = initialiser,
    )]
    pub initialiser_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = ["user_stats".as_bytes(), initialiser.key().as_ref()],
        bump
    )]
    pub initiater_stats: Account<'info, UserStats>,
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
        constraint = dispute_authority.key == &crate::state::dispute_address::ID @ CustomError::WrongDisputeAddress
    )]
    pub dispute_authority: Signer<'info>,
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct SettleReceiver<'info> {
    /// CHECK: ...
    #[account(
        mut,
        constraint = receiver.key == &escrow_acc.receiver @ CustomError::WrongAccount
    )]
    pub receiver: UncheckedAccount<'info>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = receiver,
    )]
    pub receiver_token_account: Account<'info, TokenAccount>,
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
        constraint = dispute_authority.key == &crate::state::dispute_address::ID @ CustomError::WrongDisputeAddress
    )]
    pub dispute_authority: Signer<'info>,
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> SettleInitialiser<'info> {
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
}

impl<'info> SettleReceiver<'info> {
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

pub fn settled_to_initialiser_handler(
    ctx: Context<SettleInitialiser>,  
    initialiser_amount: u64,
) -> Result<()> {

    if ctx.accounts.escrow_acc.has_rrecived == false {
        return Err(error!(CustomError::ReceiverNotYetReceived))
    }

    if initialiser_amount > ctx.accounts.escrow_acc.amount {
        return Err(error!(CustomError::AmountTooLarge))
    }

    token::transfer(ctx.accounts.transfer_initialiser_ctx().with_signer(&[&ctx.accounts.escrow_acc.as_seeds()]),
    initialiser_amount,
    )?;

    token::close_account(ctx.accounts.close_account_ctx().with_signer(&[&ctx.accounts.escrow_acc.as_seeds()]))?;

    let initiater_stats = &mut ctx.accounts.initiater_stats;
    initiater_stats.purchase_disputes += 1;

    Ok(())
}

pub fn settled_to_receiver_handler(
    ctx: Context<SettleReceiver>,  
    receiver_amount: u64,
) -> Result<()> {

    if receiver_amount > ctx.accounts.escrow_acc.amount {
        return Err(error!(CustomError::AmountTooLarge))
    }

    if ctx.accounts.escrow_acc.has_rrecived == true {
        return Err(error!(CustomError::ReceiverAlreadyReceived))
    }

    token::transfer(ctx.accounts.transfer_receiver_ctx().with_signer(&[&ctx.accounts.escrow_acc.as_seeds()]),
    receiver_amount,
    )?;

    let escrow = &mut ctx.accounts.escrow_acc;
    escrow.has_rrecived = true;

    let receiver_stats = &mut ctx.accounts.receiver_stats;
    receiver_stats.sale_disputes += 1;

    Ok(())
}
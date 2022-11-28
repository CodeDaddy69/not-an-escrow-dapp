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
use crate::state::{TransState, Escrow, UserStats, Listing};
use crate::CustomError;

#[derive(Accounts)]
pub struct BuyerReceived<'info> {
    #[account(mut, close = receiver)]
    pub listing: Account<'info, Listing>,
    #[account(
        mut,
        constraint = initialiser.key == &escrow_acc.initialiser @ CustomError::WrongAccount
    )]
    pub initialiser: Signer<'info>,
    #[account(
        constraint = receiver.key == &escrow_acc.receiver @ CustomError::WrongAccount
    )]
    /// CHECK: Need for ATA
    #[account(mut)]
    pub receiver: SystemAccount<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = receiver,
    )]
    pub receiver_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = escrow_acc.state == TransState::SellerSent @ CustomError::WrongState
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
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> BuyerReceived<'info> {
    pub fn close_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = CloseAccount {
            account: self.escrow_token_account.to_account_info(),
            destination: self.initialiser.to_account_info(),
            authority: self.escrow_acc.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = Transfer {
            from: self.escrow_token_account.to_account_info(),
            to: self.receiver_token_account.to_account_info(),
            authority: self.escrow_acc.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn buyer_received_handler(ctx: Context<BuyerReceived>, to_dispute: bool) -> Result<()> {

    // TODO: VERIFY ACCOUNTS/DO CHECKS

    // FINALISE OR SEND TO DISPUTE
    if to_dispute {
    
        // TODO: ADD DISPUTE FUNCTIONALITY

        let escrow = &mut ctx.accounts.escrow_acc;
        escrow.state = TransState::Dispute;
        
    } else {

        let escrow = &ctx.accounts.escrow_acc;

        token::transfer(
            ctx.accounts.transfer_ctx().with_signer(&[&[
                "escrow".as_bytes(),
                escrow.initialiser.as_ref(),
                escrow.listing.as_ref(),
                &[escrow.bump],
            ]]),
            escrow.amount,
        )?;

        token::close_account(ctx.accounts.close_account_ctx().with_signer(&[&[
            "escrow".as_bytes(),
            escrow.initialiser.as_ref(),
            escrow.listing.as_ref(),
            &[escrow.bump],
        ]]))?;

        let escrow = &mut ctx.accounts.escrow_acc;
        escrow.state = TransState::Finalised;

        let initiater_stats = &mut ctx.accounts.initiater_stats;
        initiater_stats.purchases += 1;
        let receiver_stats = &mut ctx.accounts.receiver_stats;
        receiver_stats.sales += 1;
    }

    Ok(())
}
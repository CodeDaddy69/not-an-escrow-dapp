use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{
    self,
    Transfer,
    TokenAccount,
    Token,
    Mint
}};
use crate::state::{TransState, Escrow};
use crate::CustomError;

#[derive(Accounts)]
pub struct BuyerTransfer<'info> {
    #[account(mut)]
    pub initialiser: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = initialiser,
        constraint = initialiser_token_account.amount >= escrow.amount
    )]
    pub initialiser_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = escrow.state == TransState::Initialised @ CustomError::WrongState
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = escrow
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    // pub rent: Sysvar<'info, Rent>
}

impl<'info> BuyerTransfer<'info> {
    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = Transfer {
            from: self.initialiser_token_account.to_account_info(),
            to: self.escrow_token_account.to_account_info(),
            authority: self.initialiser.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn buyer_transfer_handler(ctx: Context<BuyerTransfer>) -> Result<()> {

    // TODO: VERIFY ACCOUNTS/DO CHECKS


    token::transfer(
        ctx.accounts.transfer_ctx(),
        ctx.accounts.escrow.amount
    )?;

    let escrow = &mut ctx.accounts.escrow;
    escrow.state = TransState::BuyerSent;
    
    Ok(())
}
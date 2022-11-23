use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, Token,
};

declare_id!("A1WQcJ7w8QPmyUmjUtfsvVMk47pCYcXSFf9hZq7mRwUF");

pub fn init_mint (
    ctx: Context<InitMint>
) -> Result<()> {
    Ok(())
}


#[derive(Accounts)]
pub struct InitMint<'info> {
    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer,
    )]
    pub mint: Account<'info, token::Mint>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
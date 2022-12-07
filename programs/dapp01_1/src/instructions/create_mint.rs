use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, Token,
};

declare_id!("A1WQcJ7w8QPmyUmjUtfsvVMk47pCYcXSFf9hZq7mRwUF");

pub fn init_mint (
    _ctx: Context<InitMint>
) -> Result<()> {
    println!("Adam licks windows");
    Ok(())
}


#[derive(Accounts)]
pub struct InitMint<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}
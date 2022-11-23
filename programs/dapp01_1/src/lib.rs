use anchor_lang::prelude::*;

mod instructions;
pub mod state;

use instructions::*;

declare_id!("A1WQcJ7w8QPmyUmjUtfsvVMk47pCYcXSFf9hZq7mRwUF");

#[program]
pub mod dapp01_1 {
    use super::*;

    pub fn initialise_transaction(
        ctx: Context<InitialiseTransaction>, 
        amount: u64
    ) -> Result<()> {
        instructions::initialise_transaction_handler(ctx, amount)
    }

    pub fn create_mint(
        ctx: Context<InitMint>, 
    ) -> Result<()> {
        instructions::init_mint(ctx)
    }
}

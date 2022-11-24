use anchor_lang::prelude::*;

mod instructions;
pub mod state;
pub mod events;

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

    pub fn buyer_transfer(
        ctx: Context<BuyerTransfer>,
    ) -> Result<()> {
        instructions::buyer_transfer_handler(ctx)
    }
}

#[error_code]
pub enum CustomError {
    #[msg("The state of the escrow given does not match the state required")]
    WrongState
}
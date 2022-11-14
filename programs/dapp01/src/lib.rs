use anchor_lang::prelude::*;

mod instructions;
pub mod state;

use instructions::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod dapp01 {
    use super::*;

    pub fn initialise_transaction(ctx: Context<InitialiseTransaction>, amount: u64) -> Result<()> {
        instructions::initialise_transaction_handler(ctx, amount);
        Ok(())
    }
}

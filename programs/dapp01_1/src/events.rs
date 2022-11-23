use anchor_lang::prelude::*;

#[event]
pub struct TransactionUpdated {
    pub transaction: Pubkey,
}
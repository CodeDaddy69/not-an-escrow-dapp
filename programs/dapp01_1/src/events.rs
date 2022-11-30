use anchor_lang::prelude::*;

#[event]
pub struct TransactionUpdated {
    pub transaction: Pubkey,
}

#[event]
pub struct TransactionClosed {
    pub transaction: Pubkey,
}

#[event]
pub struct DisputeSettled {
    pub transaction: Pubkey,
}
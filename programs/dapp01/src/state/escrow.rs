use anchor_lang::prelude::*;

#[account]
pub struct Escrow {
    // sending address
    pub initialiser: Pubkey,
    // receiving address
    pub receiver: Pubkey,
    // amount
    pub amount: u64
}

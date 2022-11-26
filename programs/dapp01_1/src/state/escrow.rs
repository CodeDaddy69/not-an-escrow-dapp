use anchor_lang::prelude::*;

use super::TransState;

#[account]
pub struct Escrow {
    // sending address
    pub initialiser: Pubkey,
    // receiving address
    pub receiver: Pubkey,
    // amount
    pub amount: u64,
    // state
    pub state: TransState, 
    // account bump
    pub bump: u8
}


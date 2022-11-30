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
    pub bump: [u8; 1],
    // listing address
    pub listing: Pubkey,
    // has the receiver received their mullah
    pub has_rrecived: bool
}

impl Escrow {
    pub fn as_seeds(&self) -> [&[u8]; 4] {
        ["escrow".as_bytes(), self.initialiser.as_ref(), self.listing.as_ref(), &self.bump]
    }
}


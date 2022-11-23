use anchor_lang::prelude::*;

mod escrow;

pub use escrow::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum TransState {
    Initialised,
    BuyerSent,
    SellerSent,
    Finalised,
    Dispute
}
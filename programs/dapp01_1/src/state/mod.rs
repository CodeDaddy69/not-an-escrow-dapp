use anchor_lang::prelude::*;

mod escrow;
mod user_stats;

pub use escrow::*;
pub use user_stats::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum TransState {
    Initialised,
    BuyerSent,
    SellerSent,
    Finalised,
    Dispute
}
use anchor_lang::prelude::*;

mod escrow;
mod user_stats;
mod listing;

pub use escrow::*;
pub use user_stats::*;
pub use listing::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum TransState {
    Initialised,
    BuyerSent,
    SellerSent,
    Finalised,
    Dispute,
    DisputeSettled
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum ItemType {
    Jacket
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum Colour {
    Blue
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum Tag {
    New,
    Used,
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum SaleState {
    ForSale,
    Sold
}

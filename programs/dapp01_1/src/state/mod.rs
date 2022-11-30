use anchor_lang::prelude::*;


mod escrow;
mod user_stats;
mod listing;

pub use escrow::*;
pub use user_stats::*;
pub use listing::*;



pub mod dispute_address {
    use anchor_lang::solana_program::declare_id;
    
    declare_id!("D2zKk2kDm92NbAcFYw1L7For9uJv5ChZr9i4zbNVU5KU");
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum TransState {
    Initialised,
    BuyerSent,
    SellerSent,
    Finalised,
    Dispute,
    DisputeSettled,
    Timeout
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

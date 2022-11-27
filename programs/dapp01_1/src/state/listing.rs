use anchor_lang::prelude::*;
use super::{ItemType, Colour, Condition};

#[account]
pub struct Listing {
    // the name of the listing
    pub name: String,
    // the description of the listing
    pub description: String,
    // the type of item of the listing    
    pub item_type: ItemType,
    // the colour of the listing
    pub colour: Colour,
    // the condotion of the listing
    pub condition: Condition,
    // the seller of the listing
    pub seller: Pubkey,
    // the state of the sale
    pub sale_state: SaleState,
}

pub struct Condition {
    pub tag:,
    pub condition_map:,
}


///
/// DEPRECATED MAYBE: DESGIN CHOICE TO MAKE, LISTINGS ON CHAIN OR NOT?
/// 
/// DATA SIZE FOR ACC IS APPROX 300 - RENT EXEMPTION 0.003 SOL
/// TO KEEP LISTINGS ON CHAIN.
/// 
/// OR GENERATE A UNIQUE LISTING CODE AND SAVE THE LISTING DETAILS ON A DB.

use anchor_lang::prelude::*;
use super::{ItemType, Colour, SaleState, Tag};

#[account]
pub struct Listing {
    // PDA bump
    pub bump: u8,
    // price of listing
    pub price: u64,
    // semi-unique transaction identifier
    pub identifier: u64,
    // the name of the listing
    pub name: String,
    // the description of the listing
    // MAYBE GET RID OF DESCRITON DOESNT NEED TO BE ON CHAIN
    //pub description: String,
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Condition {
    // item clothing condition
    pub tag: Tag,
    // vec of tuple, tuple of mark on clothing represented by (is_major, is_front, x_pos, y_pos)
    pub condition_map: Vec<ConditionMap>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ConditionMap {
    is_major: bool,
    is_front: bool,
    x_pos: u8,
    y_pos: u8,
}
use anchor_lang::prelude::*;

#[account]
pub struct UserStats {
    pub purchases: u32,
    pub purchase_disputes: u32,
    pub sales: u32,
    pub sale_disputes: u32
}

impl UserStats {
    pub fn as_array(&self) -> [u32; 4] {
        [self.purchases, self.purchase_disputes, self.sales, self.sale_disputes]
    }
}
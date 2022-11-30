use anchor_lang::prelude::*;

mod instructions;
pub mod state;
pub mod events;

use instructions::*;
use state::Listing;

declare_id!("A1WQcJ7w8QPmyUmjUtfsvVMk47pCYcXSFf9hZq7mRwUF");

#[program]
pub mod dapp01_1 {

    use super::*;

    pub fn initialise_transaction(
        ctx: Context<InitialiseTransaction>, 
        amount: u64
    ) -> Result<()> {
        instructions::initialise_transaction_handler(ctx, amount)
    }

    pub fn create_mint(
        ctx: Context<InitMint>, 
    ) -> Result<()> {
        instructions::init_mint(ctx)
    }

    pub fn buyer_transfer(
        ctx: Context<BuyerTransfer>,
    ) -> Result<()> {
        instructions::buyer_transfer_handler(ctx)
    }

    pub fn seller_sent(
        ctx: Context<SellerConfirmed>
    ) -> Result<()> {
        instructions::seller_sent_handler(ctx)
    }
    pub fn buyer_received(
        ctx: Context<BuyerReceived>,
        to_dispute: bool
    ) -> Result<()> {
        instructions::buyer_received_handler(ctx, to_dispute)
    }

    pub fn initialise_user(
        ctx: Context<InitialiseUser>
    ) -> Result<()> {
        instructions::initialise_user_handler(ctx)
    }

    pub fn create_listing(
        ctx: Context<InitialiseListing>,
        listing_args: Listing
    ) -> Result<()> {
        instructions::initialise_listing_handler(ctx, listing_args)
    }

    pub fn settle_initialiser(
        ctx: Context<SettleInitialiser>,
        initialiser_amount: u64,
    ) -> Result<()> {
        instructions::settled_to_initialiser_handler(ctx, initialiser_amount)
    }

    pub fn settle_receiver(
        ctx: Context<SettleReceiver>,
        receiver_amount: u64,
    ) -> Result<()> {
        instructions::settled_to_receiver_handler(ctx, receiver_amount)
    }
}

#[constant]
pub const MAX_NAME_LEN: usize = 50;
#[constant]
pub const MAX_DESC_LEN: usize = 200;

#[error_code]
pub enum CustomError {
    #[msg("The state of the escrow given does not match the state required")]
    WrongState,
    #[msg("The account given does not match that of the respective account in escrow")]
    WrongAccount,
    #[msg("The user account has already been initialised")]
    UserAlreadyInitialised,
    #[msg("The listing does not belong to the receiver of the transaction")]
    WrongListing,
    #[msg("The dispute address entered does not match the one on the smart contract")]
    WrongDisputeAddress,
    #[msg("The amount being transfered is larger than the amount stored in the escrow state")]
    AmountTooLarge,
    #[msg("The seller has already been sent their tokens")]
    ReceiverAlreadyReceived,
    #[msg("The seller needs to be sent tokens before the buyer")]
    ReceiverNotYetReceived
}   
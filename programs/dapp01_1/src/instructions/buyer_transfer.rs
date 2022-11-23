anchor_lang::prelude::*;
anchor_spl::

#[derive(accounts)]
pub struct BuyerTransfer<'info> {
    #[account(mut)]
    pub initialiser: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        associated_token::mint = mint,
        associated_token::authority = initialiser
    )]
    pub initialiser_token_account: Account<'info, TokenAccount>,
    pub escrow: Account<'info, Escrow>,
    #[account(
        associated_token::mint = mint,
        associated_token::authority = escrow
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>
}

impl<'info> BuyerTransfer<'info> {
    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer> {
        let program = self.token_program.to_account_info();
        let accounts = Transfer {
            from: self.initialiser_token_account.to_account_info(),
            to: self.escrow_token_account.to_account_info(),
            authority: self.initialiser.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}
pub fn buyer_transfer(ctx: Context<BuyerTransfer>) -> Result<()> {

    // TODO: VERIFY ACCOUNTS/DO CHECKS


    let amount = &ctx.accounts.escrow.amount;

    let ctx = Transfer
}
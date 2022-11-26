use anchor_lang::prelude::*;
use crate::state::UserStats;
//use crate::CustomError;

#[derive(Accounts)]
pub struct InitialiseUser<'info> {
    #[account(
        init,
        payer = initialiser,
        space = 8 + 4 + 4 + 4 + 4,
        seeds = ["user_stats".as_bytes(), initialiser.key().as_ref()],
        bump
    )]
    user_stats: Account<'info, UserStats>,
    #[account(mut)]
    initialiser: Signer<'info>,
    system_program: Program<'info, System>
}

pub fn initialise_user_handler(ctx: Context<InitialiseUser>) -> Result<()> {

    let initial_stats = UserStats {
        purchases: 0,
        purchase_disputes: 0,
        sales: 0,
        sale_disputes: 0
    };

    ctx.accounts.user_stats.set_inner(initial_stats);

    // check for non-zero account stats
    // for x in &ctx.accounts.user_stats.as_array() {
    //     if x != &0 {
    //         return err!(CustomError::UserAlreadyInitialised);
    //     }
    // }
    Ok(())
}
use anchor_lang::{prelude::*,  system_program::Transfer};

use crate::state::{Listing, Marketplace};


#[derive(Accounts)]
//#[instruction(sensor_id: u64)]
pub struct DeleteListing<'info> {
    #[account(
        seeds = [b"marketplace", marketplace.name.as_bytes()], //make generic
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
   pub maker: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [marketplace.key().as_ref(), 
        maker.key().as_ref()
        //&sensor_id.to_le_bytes()
        ], 
        bump, 
        close = owner
    )]
    pub listing: Account<'info, Listing>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl <'info> DeleteListing<'info> {
    
   
}
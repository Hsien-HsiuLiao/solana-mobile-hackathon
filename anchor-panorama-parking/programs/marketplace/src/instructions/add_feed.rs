use anchor_lang::{prelude::*,  system_program::Transfer};

use crate::state::{Listing, Marketplace, NotificationSettings, ParkingSpaceStatus};
use crate::error::ErrorCode;


#[derive(Accounts)]
pub struct AddFeedToListing<'info> {
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
        realloc = 8 + Listing::INIT_SPACE,
        realloc::payer = admin, 
        realloc::zero = true, 
    )]
    pub listing: Account<'info, Listing>,
   
    #[account(mut)]
    pub admin: Signer<'info>, 
    pub system_program: Program<'info, System>,

}


impl <'info> AddFeedToListing<'info> {
    pub fn add_feed(&mut self, feed: Pubkey) -> Result<()> {
         //only admin
         if self.admin.key() != self.marketplace.admin {
            return Err(ErrorCode::Unauthorized.into());
        }

        let listing = &mut self.listing;

        listing.feed = Some(feed);

        msg!("Feed {} added to listing {:?}", feed, listing);

        Ok(())

    }
    
}
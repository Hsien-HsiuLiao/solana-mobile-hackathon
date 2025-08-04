use anchor_lang::{prelude::*,  system_program::Transfer};

use crate::state::{Listing, Marketplace};
use crate::error::ErrorCode;


#[derive(Accounts)]
#[instruction(sensor_id: u64)]
pub struct UpdateListing<'info> {
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
        realloc::payer = owner, 
        realloc::zero = true, 
    )]
    pub listing: Account<'info, Listing>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl <'info> UpdateListing<'info> {
    
    
    pub fn update_listing(&mut self, 
        address: Option<String>, 
        rental_rate:Option<u32>, 
        sensor_id:Option<String>, 
        latitude:Option<f64>, 
        longitude:Option<f64>, 
        additional_info:Option<String>, 
        availabilty_start:Option<i64>, 
        availabilty_end:Option<i64>,
        email: Option<String>,
        phone: Option<String>, 
        bumps: &UpdateListingBumps) -> Result<()> {

            if self.owner.key() != self.listing.maker {

                return Err(ErrorCode::Unauthorized.into());
            }
            self.listing.set_inner(Listing { 
                maker: self.owner.key(), 
                email: email.unwrap(),
                phone: phone.unwrap(),
                bump: bumps.listing,
                address: address.unwrap(),
                rental_rate: rental_rate.unwrap(),
                availabilty_start: availabilty_start.unwrap(), 
                availabilty_end: availabilty_end.unwrap(),
                sensor_id: sensor_id.unwrap(),
                parking_space_status: self.listing.parking_space_status,
                reserved_by: self.listing.reserved_by,
                reservation_start: self.listing.reservation_start,
                reservation_end: self.listing.reservation_end,
                latitude: latitude.unwrap(), 
                longitude: longitude.unwrap(), 
                additional_info, 
                feed: self.listing.feed
            });
    
            msg!("You updated a listing");

            Ok(())

    }
}
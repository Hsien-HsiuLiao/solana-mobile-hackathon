use anchor_lang::{prelude::*,  system_program::Transfer};

use crate::state::{Listing, Marketplace, ParkingSpaceStatus};

#[derive(Accounts, Debug)]
#[instruction(sensor_id: String)]
pub struct List<'info> {
   #[account(mut)]
   pub maker: Signer<'info>,
   
    #[account(
        //derivation
        seeds = [b"marketplace", marketplace.name.as_bytes()], //make generic
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,
   
    #[account(
        init,
        payer = maker, 
        seeds = [marketplace.key().as_ref(), 
        /* &sensor_id.as_bytes()[..16],  */ //try as_ref()
        maker.key().as_ref()
        ], //listing sensor_id

        bump,
        space = 8 + Listing::INIT_SPACE + ParkingSpaceStatus::INIT_SPACE
    )]
    pub listing: Account<'info, Listing>, //

    pub system_program: Program<'info, System>,

}

impl <'info> List<'info> {
    pub fn create_listing(&mut self, address: String, rental_rate: u32, sensor_id: String, latitude:f64 , longitude: f64 ,  additional_info: Option<String> , availabilty_start:i64, availabilty_end:i64, email: String, phone:String,
         bumps: &ListBumps) -> Result<()> {
            //get current time, check avail start and set parking status accordingly
        let current_time = Clock::get()?.unix_timestamp;
        let mut parking_space_status = ParkingSpaceStatus::UnAvailable;

        if availabilty_start <= current_time {
            parking_space_status = ParkingSpaceStatus::Available;    
        }
        self.listing.set_inner(Listing { 
            maker: self.maker.key(), 
            email,
            phone,
            bump: bumps.listing,
            address,
            rental_rate,
            availabilty_start, 
            availabilty_end,
            sensor_id,
            parking_space_status,
            reserved_by: None,
            reservation_start: None,
            reservation_end: None,
            latitude, 
            longitude, 
            additional_info, 
            feed: None //will be set by admin
        });

        msg!("You created a listing, the parking space status is : {:?}", self.listing.parking_space_status);
        msg!("Listing info: {:?}", self.listing);

      

        
        Ok(())
    }   


    pub fn delete_listing(&mut self) -> Result<()> {
        todo!();
//        self.listing.close(sol_destination)
    }
}
use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};




use crate::{ state::{Listing, Marketplace, ParkingSpaceStatus}};

#[derive(Accounts)]
pub struct ConfirmParking<'info> {
    #[account(mut)]
   pub renter: Signer<'info>,
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
        realloc::payer = maker, 
        realloc::zero = true, 
    )]
    pub listing: Account<'info, Listing>,
    pub system_program: Program<'info, System>,

}

impl <'info> ConfirmParking<'info> {
   
    pub fn confirm_parking(&mut self, sensor_id:String) -> Result<()> {

        let listing = &mut self.listing;

        //check arrival time is within reservation start time
        let current_time = Clock::get()?.unix_timestamp;
        if current_time < listing.availabilty_start {
           msg!("Driver is early");
           //update start time so driver is charged
        }
        
       
        if sensor_id == listing.sensor_id {
            listing.parking_space_status = ParkingSpaceStatus::Occupied;

            //https://solana.com/docs/core/cpi
            //transfer sol from driver to homeowner
            let cpi_program = self.system_program.to_account_info();

        let cpi_account = Transfer{
            from: self.renter.to_account_info(),
            to: self.maker.to_account_info()
        };

        let cpi_ctx: CpiContext<'_, '_, '_, '_, Transfer<'_>> = CpiContext::new(cpi_program, cpi_account);

        let duration = listing.reservation_end.unwrap() - listing.reservation_start.unwrap();
        let rate_per_hour:i64 = listing.rental_rate.into();
        
        let reservation_amount:u64 = ((duration / 3600) * rate_per_hour).try_into().unwrap();

        let amount = reservation_amount + self.marketplace.fee as u64;

        transfer(cpi_ctx, amount)?;

        }

        //how to emit and listen for events https://www.rareskills.io/post/solana-logs-transaction-history
        //event triggers script to check sensor 5 min before end time
              emit!(ParkingConfirmed {
                listing_id: listing.key(),
              //  driver: driver.key,
             //   homeowner: homeowner.key,
             //   amount: transfer_amount,
                sensor_id: sensor_id,
            });

        // if driver leaves early, they will still be charged reserved time, similar to parking meter 
       
        // Notify the homeowner
        // Notify the driver
       
        Ok(())


    }
    
}


#[event]
pub struct ParkingConfirmed {
    pub listing_id: Pubkey,
//    pub driver: Pubkey,
  //  pub homeowner: Pubkey,
  //  pub amount: u64,
    pub sensor_id: String,
}
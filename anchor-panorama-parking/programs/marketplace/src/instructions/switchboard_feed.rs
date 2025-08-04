use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;
use switchboard_on_demand::prelude::rust_decimal::Decimal;




use crate::{ state::{Listing, Marketplace, ParkingSpaceStatus}};

#[derive(Accounts)]
pub struct SwitchboardFeed<'info> {
    //safety check: Struct field "feed" is unsafe, but is not documented.   add ///CHECK
        /// CHECK: via switchboard sdk
    pub feed: AccountInfo<'info>,

    #[account(
        seeds = [b"marketplace", marketplace.name.as_bytes()], //make generic
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        mut,
        seeds = [marketplace.key().as_ref(), 
        maker.key().as_ref()
        //&sensor_id.to_le_bytes()
        ], 
        bump, 
      //  realloc = 8 + Listing::INIT_SPACE,
      //  realloc::payer = maker, 
     //   realloc::zero = true, 
    )]
    pub listing: Account<'info, Listing>,
    #[account(mut)]
    pub renter: Signer<'info>,
    pub system_program: Program<'info, System>,

}

impl <'info> SwitchboardFeed<'info> {
   
    pub fn sensor_change(&mut self) -> Result<()> { //when driver arrives or leaves
      // Feed account data
      let feed_account = self.feed.data.borrow();//ctx.accounts.feed.data.borrow();

       // Verify that this account is the intended one by comparing public keys
       // if ctx.accounts.feed.key != &specific_pubkey {
       //     throwSomeError
       // }
       //

       // Docs at: https://switchboard-on-demand-rust-docs.web.app/on_demand/accounts/pull_feed/struct.PullFeedAccountData.html
       let feed = PullFeedAccountData::parse(feed_account).unwrap();
      
       msg!("sensor data, distance_in_cm: {:?}", feed.value().unwrap());
       //distance < 30 cm, car parked, >30cm car left space

       //when driver leaves, sensor detects change. a server function monitoring for changes (or anchor test) will
       // call this instruction, get the data and verify value is over x cm, then msg homeowner and parkingspace status updated

       //user story 1c
   //driver receives confirmation

   let distance= feed.value().unwrap();

   // Check if the distance indicates the car has left the space
   if distance > Decimal::from(30) {
       let listing = &mut self.listing;//&mut ctx.accounts.listing;

       // Update the parking space status to Available
       listing.parking_space_status = ParkingSpaceStatus::Available;

       // Notify the homeowner of the change
     //  msg!("Parking space is now available for listing: {:?}", listing);

       //check if driver left on time and/or within 5 min grace period
       //if not charge a penalty and transfer to homeowner

       let current_time = Clock::get()?.unix_timestamp;
       let grace_period = 300; // 5min
        if current_time > listing.availabilty_end + grace_period{
            let cpi_program = self.system_program.to_account_info();

            let cpi_account = Transfer{
                from: self.renter.to_account_info(),
                to: self.maker.to_account_info()
            };
     
            let cpi_ctx: CpiContext<'_, '_, '_, '_, Transfer<'_>> = CpiContext::new(cpi_program, cpi_account);
     
            let duration = current_time - listing.reservation_start.unwrap() + grace_period;
            let rate_per_hour:i64 = listing.rental_rate.into();
            
            let penalty:u64 = ((duration / 3600) * rate_per_hour).try_into().unwrap();
     
     
            transfer(cpi_ctx, penalty)?;
     
        }
       
   }
  /*  if distance <= Decimal::from(30){
       //cannot yet confirm parking space in use, driver needs to also scan QR code to confirm
   } */

        Ok(())
    }

    
}


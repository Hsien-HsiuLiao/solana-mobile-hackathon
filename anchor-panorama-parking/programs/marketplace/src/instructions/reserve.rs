use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};


use crate::{ state::{Listing, Marketplace, ParkingSpaceStatus}};
use crate::error::ErrorCode;


#[derive(Accounts)]
//#[instruction(sensor_id: String)]
/* Error: AnchorError occurred. Error Code: InstructionDidNotDeserialize. Error Number: 102. 
Error Message: The program could not deserialize the given instruction.
 */
pub struct Reserve<'info> {
   #[account(mut)]
   pub renter: Signer<'info>,
   #[account(mut)]
   pub maker: SystemAccount<'info>, 
   
    #[account(
       
        seeds = [b"marketplace", marketplace.name.as_bytes()], //make generic
        bump, 
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        mut,
       // seeds = [marketplace.key().as_ref(), &sensor_id.to_le_bytes()], //
       seeds = [marketplace.key().as_ref(), 
        /* &sensor_id.as_bytes()[..16],  */
        maker.key().as_ref()
        ], 
        bump,
        constraint = listing.parking_space_status == ParkingSpaceStatus::Available
        )]
    pub listing: Account<'info, Listing>,   //
   /*  #[account(
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
    pub listing: Account<'info, Listing>, */
   

    pub system_program: Program<'info, System>,

}

impl <'info> Reserve<'info> {
    pub fn reserve_listing(&mut self, start_time: i64, end_time: i64) -> Result<()> {

        let listing = &mut self.listing;

        //does driver have enough funds?
        let duration = end_time - start_time;
        let rate_per_hour:i64 = listing.rental_rate.into();
        
        let driver_has_sufficient_funds:bool = self.renter.to_account_info().lamports() >= ((duration / 3600) * rate_per_hour).try_into().unwrap();

        if !driver_has_sufficient_funds {
            return Err(ErrorCode::InsufficientFunds.into());
        }
    
        if listing.parking_space_status != ParkingSpaceStatus::Available {
            return Err(ErrorCode::ListingNotAvailable.into());
        }
    
        listing.reserved_by = Some(self.renter.key());
        listing.reservation_start = Some(start_time);
        listing.reservation_end = Some(end_time);
        listing.parking_space_status = ParkingSpaceStatus::Reserved;

        //msg homeowner that space is reserved
        //msg driver with reservation info, user story2B

         // Message to driver
    msg!("You reserved a listing, the parking space status is: {:?}", listing.parking_space_status);
    msg!("Reservation details: Start Time: {}, End Time: {}", start_time, end_time);

    // Message to homeowner that space is reserved
    let homeowner_msg = format!(
        "Your parking space has been reserved by {} from {} to {}.",
        self.renter.key(),
        start_time,
        end_time
    );
    msg!("{}", homeowner_msg);

    //send a message to the driver with reservation info
    let driver_msg = format!(
        "Reservation confirmed! Your parking space is reserved from {} to {}.",
        start_time,
        end_time
    );
    msg!("{}", driver_msg);

      Ok(())
    }

    
}


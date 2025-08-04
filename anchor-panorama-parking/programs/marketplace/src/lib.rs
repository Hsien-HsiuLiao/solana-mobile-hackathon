#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
//use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;

mod instructions;
mod state;
mod error;

pub use error::ErrorCode;


use instructions::*;
//use crate::instruction::*;

declare_id!("FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE");

#[program]
pub mod marketplace {

  //  use switchboard_on_demand::prelude::rust_decimal::Decimal;

    use crate::state::ParkingSpaceStatus;

    use super::*;

    //https://solana.com/docs/programs/examples#basics

    pub fn initialize(ctx: Context<Initialize>, name: String, fee: u32) -> Result<()> {
        ctx.accounts.init(name, fee, &ctx.bumps)?;
        Ok(())
    }

    pub fn list(
        ctx: Context<List>,
        address: String,
        rental_rate: u32,
        sensor_id: String,
        latitude: f64,
        longitude: f64,
        additional_info: Option<String>,
        availabilty_start: i64,
        availabilty_end: i64,
        email: String,
        phone: String,
    ) -> Result<()> {
        ctx.accounts.create_listing(
            address,
            rental_rate,
            sensor_id,
            latitude,
            longitude,
            additional_info,
            availabilty_start,
            availabilty_end,
            email,
            phone,
            &ctx.bumps,
        )?;
        Ok(())
    }

    pub fn add_feed_to_listing(ctx: Context<AddFeedToListing>, feed: Pubkey) -> Result<()> {
        ctx.accounts.add_feed(feed)?;
        Ok(())
    }

    pub fn update_listing(
        ctx: Context<UpdateListing>,
        address: Option<String>,
        rental_rate: Option<u32>,
        sensor_id: Option<String>,
        latitude: Option<f64>,
        longitude: Option<f64>,
        additional_info: Option<String>,
        availabilty_start: Option<i64>,
        availabilty_end: Option<i64>, 
        email: Option<String>,
        phone: Option<String>
    ) -> Result<()> {
        ctx.accounts.update_listing(address, rental_rate, sensor_id, latitude, longitude, additional_info, availabilty_start, availabilty_end, email, phone, &ctx.bumps)?;
        Ok(())
    }

    pub fn delete_listing(_ctx: Context<DeleteListing>) -> Result<()> {
        msg!("Listing deleted");
        Ok(())
    }

    pub fn set_notification_settings(
        ctx: Context<SetNotificationSettings>,
        app: bool,
        email: bool,
        phone: bool,
    ) -> Result<()> {
        ctx.accounts.set_notification_settings(app, email, phone)?;
        msg!(
            "Notification settings updated for user: {:?}",
            ctx.accounts.user.key()
        );
        Ok(())
    }

    pub fn reserve(ctx: Context<Reserve>, start_time: i64, end_time: i64) -> Result<()> {
        ctx.accounts.reserve_listing(start_time, end_time)?;
        Ok(())
    }

    //pub fn update_reservation()

    pub fn sensor_change<'a>(ctx: Context<SwitchboardFeed>) -> Result<()> {
        //when driver arrives or leaves
        ctx.accounts.sensor_change()?;
        Ok(())
    }

    // {//driver scans QR code to confirm arrival and parking},
    //should also send alert to homeowner
    pub fn confirm_parking(ctx: Context<ConfirmParking>, sensor_id: String) -> Result<()> {
        ctx.accounts.confirm_parking(sensor_id)?;
        Ok(())
    }
    
}



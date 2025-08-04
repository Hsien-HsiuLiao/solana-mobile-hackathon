use anchor_lang::{prelude::*,  system_program::Transfer};

use crate::state::{Listing, Marketplace, NotificationSettings, ParkingSpaceStatus};

#[derive(Accounts)]
pub struct SetNotificationSettings<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user, 
        seeds = [user.key().as_ref()], 

        bump,
        space = 8 + NotificationSettings::INIT_SPACE
    )]
    pub notification: Account<'info, NotificationSettings>,
  
    pub system_program: Program<'info, System>,

}

impl <'info> SetNotificationSettings<'info> {
    pub fn set_notification_settings(
        &mut self,
        app: bool,
        text: bool,
        email: bool,
    ) -> Result<()> {
        self.notification.app = app;
        self.notification.text = text;
        self.notification.email = email;
        //        self.notification.set_inner(inner);

        msg!("Notification settings updated for user: {:?}", self.user.key());

        Ok(())
    }
    
}
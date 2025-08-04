use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct NotificationSettings {
   pub app: bool,
   pub text: bool,
   pub email: bool

}
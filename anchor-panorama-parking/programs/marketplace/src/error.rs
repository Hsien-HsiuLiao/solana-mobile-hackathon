use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Custom error message")]
    CustomError,
    
    #[msg("Unauthorized access.")]
    Unauthorized,

    #[msg("The listing is not available for reservation.")]
    ListingNotAvailable,

    #[msg("Insufficient funds")]
    InsufficientFunds
}
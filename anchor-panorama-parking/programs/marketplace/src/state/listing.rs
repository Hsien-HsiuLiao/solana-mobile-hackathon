use anchor_lang::prelude::*;


#[account]
#[derive(InitSpace, Debug)]
pub struct Listing {
    pub maker: Pubkey,
    #[max_len(32)] 
    pub email: String,
    #[max_len(8)] 
    pub phone: String,
    pub bump: u8, 
    #[max_len(32)] 
    pub address: String,
    pub latitude:f64, 
    pub longitude:f64,
    pub rental_rate: u32, //per hour
    pub availabilty_start: i64, //unix time stamp
    pub availabilty_end: i64,
    #[max_len(8)] 
    pub sensor_id: String, 
    pub reserved_by: Option<Pubkey>, 
    pub reservation_start: Option<i64>,
    pub reservation_end: Option<i64>,
    pub parking_space_status:ParkingSpaceStatus, 
    
    #[max_len(32)]
    pub additional_info: Option<String>,
    //date/times avail
    pub feed: Option<Pubkey>
}

#[derive(Debug, Clone, Copy, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum ParkingSpaceStatus {
    Available,
    Reserved,
    Occupied,
    UnAvailable
}

// Implement the Space trait for ParkingSpaceStatus
impl Space for ParkingSpaceStatus {
    //const LEN: usize = 1;
    // const INIT_SPACE: usize = 42; // Since we are using u8 representation
    const INIT_SPACE: usize = 1; //what should usize be?

}
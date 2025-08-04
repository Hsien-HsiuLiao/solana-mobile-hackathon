import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Marketplace } from "../target/types/marketplace";
import {
  Commitment,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  Connection
} from "@solana/web3.js";

import * as sb from "@switchboard-xyz/on-demand";
import { assert } from "chai";
import homeowner1wallet from "../homeowner1-wallet.json";
import homeowner2wallet from "../homeowner2-wallet.json";
import driverwallet from "../driver-wallet.json";

import wallet from "../HTurbin3-wallet.json";


describe("DePIN parking space marketplace", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.getProvider();

 // const connection = provider.connection;
  const commitment: Commitment = "confirmed";

  const connection = new Connection("https://turbine-solanad-4cde.devnet.rpcpool.com/168dd64f-ce5e-4e19-a836-f6482ad6b396", commitment); 
//  const connection = new Connection("https://turbine-solanad-43ad.devnet.rpcpool.com/abdbf6bf-acc3-49e8-8075-4422a5789e87", commitment); 

//new
//turbine-solanad-43ad
//abdbf6bf-acc3-49e8-8075-4422a5789e87

  const program = anchor.workspace.marketplace as Program<Marketplace>;
  const programId = program.programId;

  //helpers
  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block,
    });
    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };

  //get/find accounts
  // homeowners provide parking space, drivers reserve the space
 /*  const [, homeowner3, ] = Array.from({ length: 4 }, () =>
    Keypair.generate()
  ); */
  const admin = Keypair.fromSecretKey(new Uint8Array(wallet)); //("Coop1aAuEqbN3Pm9TzohXvS3kM4zpp3pJZ9D4M2uWXH2");

  const homeowner1 = Keypair.fromSecretKey(new Uint8Array(homeowner1wallet)); //DmipzvprT5w4sYLVLARzUuxazAMUqm1iUbJZ88Yk58XS

  const homeowner2 = Keypair.fromSecretKey(new Uint8Array(homeowner2wallet)); //Av2tsxqpU6LC5vr5gccQyx8rVR9gfcEEvxPxVtd7Z3qc

  const driver = Keypair.fromSecretKey(new Uint8Array(driverwallet)); //8wbbE8vUPfuR16nZ6YcBsggZuSMVrFvKQr7fbXuZjWz
  //console.log(`publickey: ${admin.publicKey} `);

  const marketplace_name = "DePIN PANORAMA PARKING";

  let marketplace: PublicKey;
  let marketplaceBump;

//https://solana.com/docs/core/pda#create-pda-accounts
  [marketplace, marketplaceBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
    program.programId
  );

  /* const listing = PublicKey.findProgramAddressSync(
    [marketplace.toBuffer(), Buffer.from(sensorId)],
    program.programId
  )[0];

  console.log("listing", listing);
 */

  it("Airdrop", async () => {
    /* const homeowner1Tx = await connection.requestAirdrop(homeowner1.publicKey, 2 * LAMPORTS_PER_SOL);
    const homeowner2Tx = await connection.requestAirdrop(homeowner2.publicKey, 2 * LAMPORTS_PER_SOL);
    const homeowner3Tx = await connection.requestAirdrop(homeowner3.publicKey, 2 * LAMPORTS_PER_SOL);

    const driverTx = await connection.requestAirdrop(driver.publicKey, 2 * LAMPORTS_PER_SOL);
    const adminTX = await connection.requestAirdrop(admin.publicKey, 2 * LAMPORTS_PER_SOL);

    // confirm the airdrop transactions
    await connection.confirmTransaction(homeowner1Tx);
    await connection.confirmTransaction(homeowner2Tx);
    await connection.confirmTransaction(homeowner3Tx);

    await connection.confirmTransaction(driverTx);
    await connection.confirmTransaction(adminTX); */

    // Log the balance of each keypair
   // const balance1 = await connection.getBalance(homeowner1.publicKey);
    //  console.log(`Balance for maker/homeowner1: ${homeowner1.publicKey} ${balance1 / LAMPORTS_PER_SOL} SOL`);
      const balance1 = await connection.getBalance(homeowner1.publicKey);
      console.log(`Balance for maker/homeowner1: ${homeowner1.publicKey} ${balance1 / LAMPORTS_PER_SOL} SOL`);

    const balance2 = await connection.getBalance(driver.publicKey);

  });


  xit("Is initialized!", async () => {
    const rental_fee = 0.015 * LAMPORTS_PER_SOL;

    const tx = await program.methods
      .initialize(marketplace_name, rental_fee,)
      .accountsPartial({
        admin: admin.publicKey,
        marketplace: marketplace,
      })
      .signers([])//admin
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your transaction signature", tx);
  });

  it("Create new listings for parking space rental", async () => {
    let email = "homeowner1@email.com";
    let phone = "555-555-6309"
    let address = "1234 MyStreet, Los Angeles, CA 90210";
    let rentalRate = 0.0345 * LAMPORTS_PER_SOL; //$5 USD/hr ~ 0.0345 SOL 
    let sensorId = "A946444646";
    let additional_info = "gate code is 2342";
    let availabilty_start = new anchor.BN(Math.floor(new Date('2025-05-07T10:33:30').getTime() / 1000)); //unix time stamp in seconds
    let availabilty_end = new anchor.BN(Math.floor(new Date('2026-05-15T10:33:30').getTime() / 1000));
    //console.log("date time", availabilty_end);

    //[latitude, longitude] =getLatLon(address);
    let latitude;
    let longitude;
    [latitude, longitude] = [34.2273574, -118.4500036]; //https://www.gps-coordinates.net/

    await program.methods
      .list(address, rentalRate, sensorId, latitude, longitude, additional_info, availabilty_start, availabilty_end, email, phone)
      .accountsPartial({
        maker: homeowner1.publicKey,
        marketplace: marketplace,
        //     listing: listing
      })
      .signers([homeowner1])
      .rpc()
      .then(confirm)
      .then(log);

    const listing = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner1.publicKey.toBuffer()],
      program.programId
    )[0];

    const listingAccountInfo = await connection.getAccountInfo(listing);

    assert(listingAccountInfo !== null);

    // homeowner2 creates a  listing
    email = "homeowner1@emai2.com";
    phone = "555-555-7000"
    address = "1235 MyStreet, Los Angeles, CA 90210";
    rentalRate = 0.0355 * LAMPORTS_PER_SOL; //$5 USD/hr ~ 0.0345 SOL 
    sensorId = "B946444646";
    additional_info = "";
    //[latitude, longitude] =getLatLon(address);

    [latitude, longitude] = [34.2373574, -118.4500036];

    await program.methods
      .list(address, rentalRate, sensorId, latitude, longitude, additional_info, availabilty_start, availabilty_end, email, phone)
      .accountsPartial({
        maker: homeowner2.publicKey,
        marketplace: marketplace,
        //     listing: listing
      })
      .signers([homeowner2])
      .rpc()
      .then(confirm)
      .then(log);

    const listing2 = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner2.publicKey.toBuffer()],
      program.programId
    )[0];

    const listingAccountInfo2 = await connection.getAccountInfo(listing2);

    assert(listingAccountInfo2 !== null);
  });

  it("should allow only admin to add feed account to listing", async () => {
    const listing = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner1.publicKey.toBuffer()],
      program.programId
    )[0];

    const feed = new PublicKey("J748azokS8cKaiGKgN5hsTsTuB1FJ1ikVNXKjq9DQnjg");


    await program.methods.addFeedToListing(feed)
      .accountsPartial({
        maker: homeowner1.publicKey,
        marketplace: marketplace,
        listing: listing,
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc()
      .then(confirm)
      .then(log);


    // Fetch the updated listing
    const updatedListing = await program.account.listing.fetch(listing);

    // Assert that the feed was added correctly
    assert.equal(updatedListing.feed.toString(), feed.toString(), "Feed was not added to the listing correctly");
  });

  it("should not allow an unauthorized account to add feed account to listing", async () => {
    const listing = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner1.publicKey.toBuffer()],
      program.programId
    )[0];

    const feed = new PublicKey("J748azokS8cKaiGKgN5hsTsTuB1FJ1ikVNXKjq9DQnjg");

    try {
      const result = await program.methods.addFeedToListing(feed)
        .accountsPartial({
          maker: homeowner1.publicKey,
          marketplace: marketplace,
          listing: listing,
          admin: homeowner1.publicKey,
        })
        .signers([homeowner1])
        .rpc()
        .then(confirm)
        .then(log);

      assert.fail("Expected an error but did not get one");
    }
    catch (error) {
      assert.include(error.message, "Unauthorized", "Expected an unauthorized error");
    }

    // console.log("result:", result);


    //const updatedListing = await program.account.listing.fetch(listing);

    // Assert that the feed was added correctly
    //assert.equal(updatedListing.feed.toString(), feed.toString(), "Feed was not added to the listing correctly");
  });


  it("should let user set notification settings", async () => {
    const notification = PublicKey.findProgramAddressSync(
      [homeowner1.publicKey.toBuffer()],
      programId
    )[0];

    const tx = await program.methods
      .setNotificationSettings(true, true, false) // app: true, email: true, phone: false
      .accounts({
        user: homeowner1.publicKey,
        ////   notification,
        // systemProgram: SystemProgram.programId,
      })
      .signers([homeowner1])
      .rpc();

    console.log("Transaction signature", tx);

    // Fetch the notification settings account to verify the changes
    const notificationAccount = await program.account.notificationSettings.fetch(notification);

  //  console.log(notificationAccount);

    assert.isTrue(notificationAccount.app);
    assert.isFalse(notificationAccount.email);
    assert.isTrue(notificationAccount.text);
  });

  /* it("Should allow homeowner to update listing", async () => {

    //update rental rate

  }); */

  it("Should not allow other accounts to update listing", async () => {
    let email = "homeowner1@email.com";
    let phone = "555-555-6309"
    let address = "1234 MyStreet, Los Angeles, CA 90210";
    let sensorId = "A946444646";
    let additional_info = "gate code is 2342";
    let availabilty_start = new anchor.BN(Math.floor(new Date('2025-05-07T10:33:30').getTime() / 1000)); //unix time stamp in seconds
    let availabilty_end = new anchor.BN(Math.floor(new Date('2026-05-15T10:33:30').getTime() / 1000));
    //console.log("date time", availabilty_end);

    //[latitude, longitude] =getLatLon(address);
    let latitude;
    let longitude;
    [latitude, longitude] = [34.2273574, -118.4500036];
   

    
    //have different homeowner or driver try to changes
    const listing = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner1.publicKey.toBuffer()],
      program.programId
    )[0];

    const newRentalRate = 0.055 * LAMPORTS_PER_SOL; // New rental rate

    try {
      await program.methods
        .updateListing(address, newRentalRate, sensorId, latitude, longitude, additional_info, availabilty_start, availabilty_end, email, phone)
        .accountsPartial({
          maker: homeowner1.publicKey, 
          marketplace: marketplace,
          listing: listing,
          owner: homeowner2.publicKey // Unauthorized user homeowner2
        })
        .signers([homeowner2])
        .rpc()
        .then(confirm)
        .then(log);
      assert.fail("Expected an error but did not get one");
    } catch (error) {
      assert.include(error.message, "Unauthorized", "Expected an unauthorized error");
    }

  });

  it("Driver gets a list of parking spaces near destination and specified rental rate", async () => {

    let desired_rental_rate = 0.0345 * LAMPORTS_PER_SOL;
    let destination_address = "1400 MyStreet, Los Angeles, CA 90210";
    let dest_latitude;
    let dest_longitude;
    //  [latitude, longitude] = getLatLon(destination_address);
    [dest_latitude, dest_longitude] = [34.2373574, -118.4500036];


    const listings = await program.account.listing.all();
    //console.log("Here's all", listings);

    //filter listings by rental_rate and distance from destination
    //listings[0].account.rentalRate
    /* let filteredListings;
    for (let i=0; i< listings.length) {
      if (listings[i].account.rentalRate <= desired_rental_rate){
        filteredListings.add(listings[i]);
      }
    } */

    // maximum distance from listing address to destination for filtering listings
    const maxDistance = 1; // 1 mile

    // Function to calculate distance between two lat/lon points
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 3959; // Radius of the Earth in miles
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in  miles
    };

    // Filter listings based on distance and rental rate
    const filteredListings = listings.filter(listing => {
    //  console.log("address", listing.account.address);
      const listingLatitude = listing.account.latitude; // Assuming latitude is stored as a number
      const listingLongitude = listing.account.longitude; // Assuming longitude is stored as a number
      const distance = calculateDistance(dest_latitude, dest_longitude, listingLatitude, listingLongitude);
    //  console.log("distance:", distance);
      // Check if the listing is within the max distance and meets rental rate criteria
      const isWithinDistance = distance <= maxDistance;
      const isRentalRateAcceptable = listing.account.rentalRate <= desired_rental_rate;

      return isWithinDistance && isRentalRateAcceptable;
    });

    assert.equal(listings.length, 2);
    assert.equal(filteredListings.length, 1);


  });


  it("Reserve a listing", async () => {
    //can run test once, after that listing constraint wil be violated since parkingstatus is not available
    const listing = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner1.publicKey.toBuffer()],
      program.programId
    )[0];

    const listingAccountInfo = await connection.getAccountInfo(listing);
   // console.log('Account data:', listingAccountInfo.data.toString());


    // duration 15min
    let start_time = new anchor.BN(Math.floor(Date.now() / 1000)); //in seconds 
    let end_time = start_time.add(new anchor.BN(900));

    const tx = await program.methods
      .reserve(start_time, end_time)
      .accountsPartial({
        renter: driver.publicKey,
        maker: homeowner1.publicKey,
        marketplace: marketplace,
        listing: listing
      })
      .signers([driver])
      .rpc()
      .then(confirm)
      .then(log);
    console.log("Your transaction signature", tx);

  });

  //driver updates reservation

  //another account cannot update reservation
  /* it("another account cannot update reservation", async () => {

  }); */


  it("Call switchboard feed and program ix", async () => {

    const listing = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner1.publicKey.toBuffer()],
      programId
    )[0];

    const myProgram = anchor.workspace.marketplace as Program<Marketplace>;
    const listingAccount = await myProgram.account.listing.fetch(listing);
    const feed = listingAccount.feed;
    //const feed = new PublicKey("43qXTGQdvEiPYj9GQvDfvQi7Shx8ahSd3d2sYBeEizuR"); //driver leaves
    //const feed = new PublicKey("9jfL52Gmudwee1RK8yuNguoZET7DMDqKSR6DePBJNXot");


    const { keypair, connection, program } = await sb.AnchorUtils.loadEnv();

    // console.log("connection", connection);
    const sbProgram = program;
    //  console.log("program from sb.anchorutils", sbProgram);
    //const feed = new PublicKey("J748azokS8cKaiGKgN5hsTsTuB1FJ1ikVNXKjq9DQnjg");
    const feedAccountInfo = await connection.getAccountInfo(feed);
    //console.log("feedAccountInfo", feedAccountInfo);
    //console.log("feedAccountInfo", feedAccountInfo.data.toString());


    const feedAccount = new sb.PullFeed(sbProgram!, feed);
    await feedAccount.preHeatLuts();





    const [pullIx, responses, _ok, luts] = await feedAccount.fetchUpdateIx({
      numSignatures: 3,
    });
    // Instruction to  program using the switchboard feed
    const myIx = await myProgram!.methods
      .sensorChange()
      .accountsPartial({
        feed, //account name must match
        marketplace: marketplace,
        maker: homeowner1.publicKey,
        listing: listing,
     //   renter: driver.publicKey,
      //  systemProgram: SystemProgram.programId,

      })
      .signers([homeowner1])
      .rpc()
      .then(confirm)
      .then(log);


    const tx = await sb.asV0Tx({
      connection,
      ixs: [...pullIx!, /* myIx */],
      signers: [keypair],
      computeUnitPrice: 200_000,
      computeUnitLimitMultiple: 1.3,
      lookupTables: luts,
    });

    const TX_CONFIG = {
      commitment: "processed" as Commitment,
      skipPreflight: true,
      maxRetries: 0,
    };
    console.log("simulating..");
    const sim = await connection.simulateTransaction(tx, TX_CONFIG);
    const updateEvent = new sb.PullFeedValueEvent(
      sb.AnchorUtils.loggedEvents(sbProgram!, sim.value.logs!)[0]
    ).toRows();
    //  console.log("Simulated Price Updates:\n", JSON.stringify(sim.value.logs));
    //console.log("Submitted Price Updates:\n", updateEvent);

    console.log("feed value from oracle: ", updateEvent[0].value);

    console.log(`Transaction sent: ${await connection.sendTransaction(tx)}`);
  });

  //driver confirms arrival by scanning QR code connected to b link
  it("Driver confirms arrival by scanning QR code", async () => {


    const listing = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner1.publicKey.toBuffer()],
      program.programId
    )[0];

    const sensorId = "A946444646";

    // Listen for the ParkingConfirmed event
    const eventListener = program.addEventListener("parkingConfirmed", (event) => {
     // console.log("Parking confirmed event received:", event);
      assert.equal(event.listingId.toString(), listing.toString(), "Listing ID should match");
      assert.equal(event.sensorId, sensorId, "Sensor ID should match the one used in the transaction");

      //call server function to monitor sensor data 5 min before reservation end at 1 min intervals
      //todo

      // Clean up the event listener after the event is received
      program.removeEventListener(eventListener);
    });

    const tx = await program.methods
      .confirmParking(sensorId)
      .accountsPartial({
        renter: driver.publicKey,
        maker: homeowner1.publicKey,
        marketplace: marketplace,
        listing: listing,
      })
      .signers([driver])
      .rpc()
      .then(confirm)
      .then(log);

    console.log("Parking confirmation transaction signature", tx);

    // Fetch the listing to verify the parking status
    const listingAccount = await program.account.listing.fetch(listing);

   // console.log("listingAccount.parkingSpaceStatus", listingAccount.parkingSpaceStatus);

    assert.equal(Object.keys(listingAccount.parkingSpaceStatus)[0], "occupied", "Parking space status should be Occupied");

    //listen for event

    /* // Check the balances after the transaction
    const finalDriverBalance = await provider.connection.getBalance(driver.publicKey);
    const finalHomeownerBalance = await provider.connection.getBalance(homeowner1.publicKey);

    // Calculate expected transfer amount
    const duration = listingAccount.reservationEnd - listingAccount.reservationStart;
    const ratePerHour = listingAccount.rentalRate.toNumber();
    const reservationAmount = ((duration / 3600) * ratePerHour) + marketplace.fee.toNumber();

    // Assert that the driver's balance has decreased by the reservation amount
    assert.equal(finalDriverBalance, initialDriverBalance - reservationAmount, "Driver's balance should decrease by the reservation amount");

    // Assert that the homeowner's balance has increased by the reservation amount
    assert.equal(finalHomeownerBalance, initialHomeownerBalance + reservationAmount, "Homeowner's balance should increase by the reservation amount");
 */


    // Wait for a short period to ensure the event is emitted
    //await new Promise(resolve => setTimeout(resolve, 5000));

    // Clean up the event listener if the event was not received
    program.removeEventListener(eventListener);

  });


  //driver arrives early and tried to scan QR

  //driver leaves late and is charged penalty


  it("Driver  leaves on time", async () => {
    //function running on a server is monitring sensor data and calls solana program when there is a change
    // Instruction to  program using the switchboard feed
    const myProgram = anchor.workspace.marketplace as Program<Marketplace>;

    const listing = PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), homeowner1.publicKey.toBuffer()],
      programId
    )[0];

    //#mock data feed driver leaves 
   const feed = new PublicKey("9jfL52Gmudwee1RK8yuNguoZET7DMDqKSR6DePBJNXot");
   //  const feed = new PublicKey("43qXTGQdvEiPYj9GQvDfvQi7Shx8ahSd3d2sYBeEizuR"); //no longer works since api data changed
    /* try {
      // Fetch the account info
      const provConnection = provider.connection;
     // const accountInfo = await provConnection.getAccountInfo(feed);
  
      // Check if the account exists
     /*  if (accountInfo === null) {
        console.log("Account not found");
        return;
      } */
  
      // Display the account data in a readable format
    /*   console.log("Account Data:");
     /*  console.log("Lamports:", accountInfo.lamports);
      console.log("Owner:", accountInfo.owner.toBase58()); */
    /*   console.log("Data Length:", accountInfo.data.length);
      console.log("Data (Base64):", accountInfo.data.toString('base64'));
      console.log("Data (Hex):", accountInfo.data.toString('hex')); */
   /*  } catch (error) {
      console.error("Error fetching account data:", error);
    } */ 
     

    const { keypair, connection, program } = await sb.AnchorUtils.loadEnv();

    const feedAccountInfo = await connection.getAccountInfo(feed);
   // console.log("feedAccountInfo", feedAccountInfo.data.toString());
    

    const sbProgram = program;

    const feedAccount = new sb.PullFeed(sbProgram!, feed);

    await feedAccount.preHeatLuts();



    const [pullIx, responses, _ok, luts] = await feedAccount.fetchUpdateIx({
      numSignatures: 3,
    });
    const myTx = await myProgram!.methods
      .sensorChange()
      .accountsPartial({
        feed,
        marketplace: marketplace,
        maker: homeowner1.publicKey,
        listing: listing,
        renter: driver.publicKey,
        //systemProgram: SystemProgram.programId,


      })
      .signers([homeowner1, driver])
      .rpc()
      .then(confirm)
      .then(log);

    console.log("Your transaction signature", myTx);

    //assert driver lamports reduced by penalty amount
  });

  it("delete listing", async () => {
  await program.methods
  .deleteListing()
  .accountsPartial({
    maker: homeowner1.publicKey, //
    marketplace: marketplace,
   // listing: listing,
    owner: homeowner1.publicKey //
  })
  .signers([homeowner1])//
  .rpc()
  .then(confirm)
  .then(log);

  await program.methods
  .deleteListing()
  .accountsPartial({
    maker: homeowner2.publicKey, //
    marketplace: marketplace,
   // listing: listing,
    owner: homeowner2.publicKey //
  })
  .signers([homeowner2])//
  .rpc()
  .then(confirm)
  .then(log);

});



});

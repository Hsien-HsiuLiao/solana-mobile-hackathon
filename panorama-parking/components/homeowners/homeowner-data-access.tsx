"use client";

import * as anchor from '@coral-xyz/anchor';

import { getMarketplaceProgram, getMarketplaceProgramId } from "../../util/marketplace-exports";
import { AnchorProvider } from '@coral-xyz/anchor';
import { AnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
//import { useConnect } from '@wallet-ui/react'; //instead of useConnection?

import { Cluster, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from 'sonner'

import { useCluster } from "../cluster/cluster-data-access";
import { /* useAnchorProvider */SolanaProvider } from "../solana/solana-provider";
import { useTransactionToast } from '../use-transaction-toast'

import { useMemo } from "react";

interface CreateListingArgs {
  address: string;              // Address (String)
  rentalRate: number;           // Rental rate (u32)
  sensorId: string;             // Sensor ID (String)
  latitude: number;             // Latitude (f64)
  longitude: number;            // Longitude (f64)
  additionalInfo?: string;      // Additional information (Option<String>)
  availabilityStart: anchor.BN;    // Availability start (i64)
  availabilityEnd: anchor.BN;      // Availability end (i64)
  email: string;                // Email (String)
  phone: string;
  homeowner1: PublicKey;

}



export function useMarketplaceProgram() {
  const { connection } = useConnection();

  const { cluster } = useCluster();

  const transactionToast = useTransactionToast();
  const wallet = useWallet()

  const provider = new AnchorProvider(connection, wallet as AnchorWallet, { commitment: 'confirmed' })

  const programId = useMemo(
    () => getMarketplaceProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getMarketplaceProgram(provider);

  program


  const accounts = useQuery({
    queryKey: ["listings", "all", { cluster }],
    queryFn: () => program.account.listing.all(),
  });

  //console.log("useMarketplaceProgram accounts", accounts);

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const marketplace_name = "DePIN PANORAMA PARKING";

  let marketplace: PublicKey;
  let marketplaceBump;

  [marketplace, marketplaceBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
    program.programId
  );

  const createListing = useMutation<string, Error, CreateListingArgs>({
    mutationKey: ["journalEntry", "create", { cluster }],
    mutationFn: async ({ address,
      rentalRate,
      sensorId,
      latitude,
      longitude,
      additionalInfo,
      availabilityStart,
      availabilityEnd,
      email,
      phone,
      homeowner1 }) => {
      console.log({
        address,
        rentalRate,
        sensorId,
        latitude,
        longitude,
        additionalInfo,
        availabilityStart,
        availabilityEnd,
        email,
        phone,
        homeowner1
      });

      console.log("Marketplace PublicKey:", marketplace);
      console.log("Homeowner PublicKey:", homeowner1);
      const listingPDA = PublicKey.findProgramAddressSync(
        [marketplace.toBuffer(), homeowner1.toBuffer()],
        program.programId
      )[0];
      return program.methods.list(
        address,            // string
        rentalRate,         // number
        sensorId,           // string
        latitude,           // number
        longitude,          // number
        additionalInfo ?? null,     // string (optional)
        availabilityStart,   // number (i64)
        availabilityEnd,     // number (i64)
        email,              // string
        phone,                 // string

      )
        .accountsPartial({
          // maker: homeowner1,
          marketplace: marketplace,
          //     listing: listing
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create a new listing: ${error.message}`);
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createListing
  };
}

export function useMarketplaceProgramAccount({ account }: { account: PublicKey }) {

  const { cluster } = useCluster();

  const transactionToast = useTransactionToast();
  const { program, accounts } = useMarketplaceProgram();


  const accountQuery = useQuery({
    queryKey: ["journal", "fetch", { cluster, account }],
    queryFn: () => program.account.listing.fetch(account),
  });

  const marketplace_name = "DePIN PANORAMA PARKING";

  let marketplace: PublicKey;
  let marketplaceBump;

  [marketplace, marketplaceBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
    program.programId
  );

//helpers
const { connection } = useConnection();

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



  const updateListing = useMutation<string, Error, CreateListingArgs>({

    mutationKey: ["journalEntry", "update", { cluster }],
    mutationFn: async ({
      address,
      rentalRate,
      sensorId,
      latitude,
      longitude,
      additionalInfo,
      availabilityStart,
      availabilityEnd,
      email,
      phone,
      homeowner1 }) => {
      const listingPDA = PublicKey.findProgramAddressSync(
        [marketplace.toBuffer(), homeowner1.toBuffer()],
        program.programId
      )[0];

      const listing = PublicKey.findProgramAddressSync(
        [marketplace.toBuffer(), homeowner1.toBuffer()],
        program.programId
      )[0];

      return program.methods.updateListing(address,            // string
        rentalRate * LAMPORTS_PER_SOL,         // number
        sensorId,           // string
        latitude,           // number
        longitude,          // number
        additionalInfo ?? null,     // string (optional)
        availabilityStart,   // number (i64)
        availabilityEnd,     // number (i64)
        email,              // string
        phone,                 // string
      )
        .accountsPartial({
          maker: homeowner1,
          marketplace: marketplace,
          listing: listing
        })
        .rpc()
        .then(confirm)
        .then(log);
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update listing: ${error.message}`);
    },
  });
  // Define the input type for the mutation function
  interface DeleteListingInput {
    homeowner1: PublicKey; 
  }

  const deleteListing = useMutation({
    mutationKey: ["journal", "deleteEntry", { cluster, account }],
    mutationFn: async ({ homeowner1 }: DeleteListingInput) => {
      const listing = PublicKey.findProgramAddressSync(
        [marketplace.toBuffer(), homeowner1.toBuffer()],
        program.programId
      )[0];

      return program.methods.deleteListing()
        .accountsPartial({
          maker: homeowner1, //
          marketplace: marketplace,
          listing: listing,
          //     owner: homeowner1 //
        })
        .rpc()
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  return {
    accountQuery,
    updateListing,
    deleteListing,
  };
}
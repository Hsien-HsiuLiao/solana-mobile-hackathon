// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import { IDL,  } from "./depin-panorama-parking-marketplace";

import type { Marketplace } from "./depin-panorama-parking-marketplace";

// Re-export the generated IDL and type
export { Marketplace, IDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const PROGRAM_ID = new PublicKey(
  "FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE"
);

// This is a helper function to get the  Anchor program.
export function getMarketplaceProgram(provider: AnchorProvider) {
  return new Program<Marketplace>(IDL as Marketplace, provider);
}

// This is a helper function to get the program ID for the Journal program depending on the cluster.
export function getMarketplaceProgramId(cluster: Cluster) {
  switch (cluster) {
    case "devnet":
    case "testnet":
    case "mainnet-beta":
    default:
      return PROGRAM_ID;
  }
}
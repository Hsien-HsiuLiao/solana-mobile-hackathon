"use client";

import { useMarketplaceProgram } from './homeowner-data-access';
import { useWallet } from "@solana/wallet-adapter-react";
import { ListingCard } from "./homeowner-ui-update-delete-card";

export function ListingUpdateDelete() {
  const { accounts, getProgramAccount } = useMarketplaceProgram();
  const { publicKey } = useWallet();

  let currentAccountListing;

  if (accounts.data) {
    if (publicKey) { // Check if publicKey is not null
      for (let i = 0; i < accounts.data.length; i++) {
        console.log("Checking account:", accounts.data[i].account.maker.toString(), publicKey.toString());
        if (accounts.data[i].account.maker.toString() === publicKey.toString()) {
          console.log("Match found at index:", i);
          currentAccountListing = accounts.data[i];
          break;
        }
      }
    } else {
      console.error("publicKey is null");
    }
  }

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="flex justify-center alert alert-info">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className="max-w-lg mx-auto p-6 bg-green-300 rounded-lg shadow-lg">
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length && currentAccountListing ? (
        <div className="grid gap-4 ">
          <ListingCard
            key={currentAccountListing.publicKey.toString()}
            account={currentAccountListing.publicKey}
          />
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}


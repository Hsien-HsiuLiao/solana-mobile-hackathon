"use client";

import { useMarketplaceProgram } from './homeowner-data-access';
// import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { ListingCard } from "./homeowner-ui-update-delete-card";
import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';

export function ListingUpdateDelete() {
  const { accounts, getProgramAccount } = useMarketplaceProgram();
  const { account } = useWalletUi();
  const publicKey = account?.publicKey;

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
    return <AppText>Loading...</AppText>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <AppView>
        <AppText>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </AppText>
      </AppView>
    );
  }
  return (
    <AppView>
      {accounts.isLoading ? (
        <AppText>Loading...</AppText>
      ) : accounts.data?.length && currentAccountListing ? (
        <AppView>
          <ListingCard
            key={currentAccountListing.publicKey.toString()}
            account={currentAccountListing.publicKey}
          />
        </AppView>
      ) : (
        <AppView>
          <AppText>No accounts</AppText>
          <AppText>No accounts found. Create one above to get started.</AppText>
        </AppView>
      )}
    </AppView>
  );
}


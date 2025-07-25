"use client";

import { useMarketplaceProgram } from './homeowner-data-access';
// import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { ListingCard } from "./homeowner-ui-update-delete-card";
import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/components/app-theme';
import { ActivityIndicator } from 'react-native-paper';

export function ListingUpdateDelete() {
  const { accounts, getProgramAccount } = useMarketplaceProgram();
  const { account } = useWalletUi();
  const publicKey = account?.publicKey;
  const { spacing } = useAppTheme();

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
    return (
      <AppView style={{ alignItems: 'center', gap: spacing.md }}>
        <ActivityIndicator size="large" />
        <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>Loading...</AppText>
      </AppView>
    );
  }
  
  if (!getProgramAccount.data?.value) {
    return (
      <AppView style={{ alignItems: 'center', gap: spacing.md }}>
        <AppText variant="bodyMedium" style={{ opacity: 0.7, textAlign: 'center' }}>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </AppText>
      </AppView>
    );
  }
  
  return (
    <>
      {accounts.isLoading ? (
        <AppView style={{ alignItems: 'center', gap: spacing.md }}>
          <ActivityIndicator size="large" />
          <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>Loading...</AppText>
        </AppView>
      ) : accounts.data?.length && currentAccountListing ? (
        <AppView style={{ width: '100%' }}>
          <ListingCard
            key={currentAccountListing.publicKey.toString()}
            account={currentAccountListing.publicKey}
          />
        </AppView>
      ) : (
        <AppView style={{ alignItems: 'center', gap: spacing.md }}>
          <AppText variant="titleLarge">No accounts</AppText>
          <AppText variant="bodyMedium" style={{ opacity: 0.7, textAlign: 'center' }}>
            No accounts found. Create one above to get started.
          </AppText>
        </AppView>
      )}
    </>
  );
}


"use client";

import { useMarketplaceProgram } from './homeowner-data-access';
// import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { ListingCard } from "./homeowner-ui-update-delete-card";
import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/components/app-theme';
import { ActivityIndicator } from 'react-native-paper';

export function ListingUpdateDelete({ currentListing }: { currentListing: { account: any; pubkey: any } }) {
  const { accounts } = useMarketplaceProgram();
  const { spacing } = useAppTheme();

  return (
    <>
      {accounts.isLoading ? (
        <AppView style={{ alignItems: 'center', gap: spacing.md }}>
          <ActivityIndicator size="large" />
          <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>Loading...</AppText>
        </AppView>
      ) : currentListing ? (
        <AppView style={{ width: '100%' }}>
          <ListingCard
            key={currentListing.pubkey.toString()}
            account={currentListing.pubkey}
          />
        </AppView>
      ) : (
        <AppView style={{ alignItems: 'center', gap: spacing.md }}>
          <AppText variant="titleLarge">No listing found</AppText>
          <AppText variant="bodyMedium" style={{ opacity: 0.7, textAlign: 'center' }}>
            No listing found for your account.
          </AppText>
        </AppView>
      )}
    </>
  );
}


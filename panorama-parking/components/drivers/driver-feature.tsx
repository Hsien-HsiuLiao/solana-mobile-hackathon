'use client'

import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { WalletUiConnectButton } from '@/components/solana/wallet-ui-dropdown';
import { ParkingSpaceList } from './driver-ui';
import { useState } from 'react';
import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';
import { AppPage } from '@/components/app-page';
import { useAppTheme } from '@/components/app-theme';
import { TextInput } from 'react-native-paper';
import { ScrollView } from 'react-native';

export default function DriverFeature() {
  const { account } = useWalletUi();
  const publicKey = account?.publicKey;
  const { spacing } = useAppTheme();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <AppPage>
      {publicKey ? (
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={true}
        >
          <AppView style={{ alignItems: 'center', gap: spacing.sm, paddingTop: spacing.lg }}>
            <AppText variant="titleLarge">Find Your Perfect Parking Space</AppText>
            <AppText variant="bodyMedium" style={{ opacity: 0.7, textAlign: 'center' }}>
              Here's a list of parking spaces available for reservation.
            </AppText>

            <AppView style={{ width: '100%', marginTop: spacing.md }}>
              <TextInput
                mode="outlined"
          placeholder="Search for parking spaces..."
          value={searchTerm}
                onChangeText={setSearchTerm}
                style={{ marginBottom: spacing.md }}
        />
            </AppView>

            <AppView style={{ width: '100%' }}>
        <ParkingSpaceList />
            </AppView>
          </AppView>
        </ScrollView>
      ) : (
        <AppView style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: spacing.md, paddingTop: spacing.lg }}>
          <AppText variant="titleLarge">Welcome Drivers</AppText>
          <AppText variant="bodyMedium" style={{ opacity: 0.7, textAlign: 'center' }}>
            Before you can continue, please connect a wallet to browse parking spaces
          </AppText>
          <WalletUiConnectButton />
        </AppView>
      )}
    </AppPage>
  );
}

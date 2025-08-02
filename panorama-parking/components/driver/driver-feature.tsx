import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { WalletUiConnectButton } from '@/components/solana/wallet-ui-dropdown';
import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';
import { AppPage } from '@/components/app-page';
import { useAppTheme } from '@/components/app-theme';

export default function DriverFeature() {
  const { account } = useWalletUi();
  const publicKey = account?.publicKey;
  const { spacing } = useAppTheme();

  return (
    <AppPage>
      {publicKey ? (
        <AppView style={{ alignItems: 'center', gap: spacing.sm, paddingTop: spacing.lg }}>
          <AppText variant="titleLarge">Welcome Drivers</AppText>
          <AppText variant="bodyMedium" style={{ opacity: 0.7, textAlign: 'center' }}>
            Find and book parking spaces near you!
          </AppText>
          
          <AppView style={{ width: '100%', marginTop: spacing.md }}>
            <AppView style={{ alignItems: 'center', gap: spacing.md }}>
              <AppText variant="titleMedium">Coming Soon</AppText>
              <AppText variant="bodyMedium" style={{ opacity: 0.7, textAlign: 'center' }}>
                Driver features are under development. You'll be able to browse available parking spaces and make reservations soon!
              </AppText>
            </AppView>
          </AppView>
        </AppView>
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
// import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { WalletUiConnectButton } from '@/components/solana/wallet-ui-dropdown';
import { useMarketplaceProgram } from './homeowner-data-access';
import { useMarketplaceProgramAnchor } from '../../utils/useMarketplaceProgramAnchor';
import { ListingCreate } from './homeowner-ui-create';
import { ListingUpdateDelete } from './homeowner-ui-update-delete';
import { useEffect, useState } from 'react';
import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';
import { AppPage } from '@/components/app-page';
import { useAppTheme } from '@/components/app-theme';
import { BlueDebugPanel } from './debug-utils';

export default function HomeownerFeature() {
  const { account } = useWalletUi();
  const publicKey = account?.publicKey;
  const { /*programId,*/ accounts } = useMarketplaceProgram();
  const { program } = useMarketplaceProgramAnchor();
  const { spacing } = useAppTheme();
  const [currentAccountListing, setCurrentAccountListing] = useState<{ account: any; pubkey: any } | null>(null);

  // console.log('HomeownerFeature render:');
  // console.log('publicKey:', publicKey?.toString());
  // console.log('accounts.isLoading:', accounts.isLoading);
  // console.log('accounts.data:', accounts.data);
  // console.log('accounts.error:', accounts.error);
  // console.log('currentAccountListing:', currentAccountListing);

  useEffect(() => {
    if (accounts.data && publicKey) {
      // console.log('Checking for existing listing...');
      // console.log('Accounts data:', accounts.data);
      // console.log('Public key:', publicKey.toString());
      
      // Log each account for debugging
      accounts.data.forEach((acc, index) => {
        // console.log(`Account ${index}:`, {
        //   maker: acc.account.maker.toString(),
        //   publicKey: acc.publicKey.toString(),
        //   matches: acc.account.maker.toString() === publicKey.toString()
        // });
      });
      
      const found = accounts.data.find((acc) => acc.account.maker.toString() === publicKey.toString());
      // console.log('Found listing:', found);
      
      setCurrentAccountListing(found ? { account: found.account, pubkey: found.publicKey } : null);
    } else {
      // console.log('No accounts data or publicKey:', { accountsData: accounts.data, publicKey });
    }
  }, [accounts.data, publicKey]);

  return (
    <AppPage>
      {publicKey ? (
        <AppView style={{ alignItems: 'center', gap: spacing.sm, paddingTop: spacing.lg }}>
          <AppText variant="titleLarge">Welcome Homeowners</AppText>
          <AppText variant="bodyMedium" style={{ opacity: 0.7, textAlign: 'center' }}>
            Rent out your driveway and make money!
          </AppText>
          
          {/* Debug info - Commented out */}
          {/*
          <AppView style={{ backgroundColor: '#e3f2fd', padding: spacing.md, borderRadius: 8, marginTop: spacing.sm, borderWidth: 1, borderColor: '#1976d2' }}>
            <AppText variant="titleMedium" style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: spacing.xs }}>
              🔍 Debug Info
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
              Loading: {accounts.isLoading ? '🔄 Yes' : '✅ No'}
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
              Accounts count: {accounts.data?.length || 0}
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
              Current listing: {currentAccountListing ? '✅ Found' : '❌ Not found'}
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
              Public key: {publicKey?.toString().slice(0, 8)}...
            </AppText>
            
            <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
              Cluster: {accounts.data ? 'Connected' : 'Not connected'}
            </AppText>
            
            {accounts.data && accounts.data.length > 0 && (
              <AppView style={{ marginTop: spacing.xs }}>
                <AppText variant="bodyMedium" style={{ color: '#000', fontWeight: 'bold' }}>
                  Found Accounts:
                </AppText>
                {accounts.data.map((acc, index) => (
                  <AppText key={index} variant="bodySmall" style={{ color: '#000', marginLeft: spacing.xs }}>
                    {index + 1}. Maker: {acc.account.maker.toString().slice(0, 8)}... | 
                    {acc.account.maker.toString() === publicKey?.toString() ? ' ✅ MATCH' : ' ❌ No match'}
                  </AppText>
                ))}
              </AppView>
            )}
            
            <AppView style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
              <AppText 
                variant="bodyMedium" 
                style={{ color: '#1976d2', fontWeight: 'bold', textDecorationLine: 'underline' }}
                onPress={() => {
                  accounts.refetch();
                }}
              >
                🔄 Refresh
              </AppText>
              <AppText 
                variant="bodyMedium" 
                style={{ color: '#d32f2f', fontWeight: 'bold', textDecorationLine: 'underline' }}
                onPress={() => {
                  if (program) {
                    program.account.listing.all().then((accounts: any) => {
                      console.log('Manual fetch result:', accounts);
                    }).catch((error: any) => {
                      console.error('Manual fetch error:', error);
                    });
                  }
                }}
              >
                🧪 Test Program
              </AppText>
            </AppView>
          </AppView>
          */}
          
          {/* Optionally add explorer link here if needed */}
          {!currentAccountListing ? (
            <AppView style={{ width: '100%', marginTop: spacing.md }}>
              <ListingCreate />
            </AppView>
          ) : (
            <AppView style={{ width: '100%', marginTop: spacing.md }}>
              <ListingUpdateDelete currentListing={currentAccountListing} />
            </AppView>
          )}
        </AppView>
      ) : (
        <AppView style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: spacing.md, paddingTop: spacing.lg }}>
          <AppText variant="titleLarge">Welcome Homeowners</AppText>
          <AppText variant="bodyMedium" style={{ opacity: 0.7, textAlign: 'center' }}>
            Before you can continue, please connect a wallet to create a listing
          </AppText>
          <WalletUiConnectButton />
        </AppView>
      )}
    </AppPage>
  );
}

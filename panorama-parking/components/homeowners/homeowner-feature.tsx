// import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { WalletUiConnectButton } from '@/components/solana/wallet-ui-dropdown';
import { useMarketplaceProgram } from './homeowner-data-access';
import { ListingCreate } from './homeowner-ui-create';
import { ListingUpdateDelete } from './homeowner-ui-update-delete';
import { useEffect, useState } from 'react';
import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';

export default function HomeownerFeature() {
  const { account } = useWalletUi();
  const publicKey = account?.publicKey;
  const { /*programId,*/ accounts } = useMarketplaceProgram();
  const [currentAccountListing, setCurrentAccountListing] = useState<{ account: any; pubkey: any } | null>(null);

  useEffect(() => {
    if (accounts.data && publicKey) {
      const found = accounts.data.find((acc) => acc.account.maker.toString() === publicKey.toString());
      setCurrentAccountListing(found ? { account: found.account, pubkey: found.publicKey } : null);
    }
  }, [accounts.data, publicKey]);

  return publicKey ? (
    <AppView>
      <AppText variant="titleLarge">Welcome Homeowners</AppText>
      <AppText>Rent out your driveway and make money!</AppText>
      {/* Optionally add explorer link here if needed */}
      {!currentAccountListing ? (
        <AppView>
          <ListingCreate />
        </AppView>
      ) : (
        <AppView>
          <ListingUpdateDelete />
        </AppView>
      )}
    </AppView>
  ) : (
    <AppView>
      <AppText variant="titleLarge">Welcome Homeowners</AppText>
      <AppText>Before you can continue, please connect a wallet to create a listing</AppText>
      <WalletUiConnectButton />
    </AppView>
  );
}

'use client'

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero } from '../app-hero';
import { ellipsify } from '@/lib/utils';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useMarketplaceProgram } from './homeowner-data-access';
import { ListingCreate } from './homeowner-ui-create';
import { ListingUpdateDelete } from './homeowner-ui-update-delete';
import { useEffect, useState } from 'react';

export default function HomeownerFeature() {
  const { publicKey } = useWallet();
  const { programId, accounts } = useMarketplaceProgram();
  const [currentAccountListing, setCurrentAccountListing] = useState(null);

  useEffect(() => {
    if (accounts.data && publicKey) {
      const found = accounts.data.find(acc => acc.account.maker.toString() === publicKey.toString());
      setCurrentAccountListing(found || null);
    }
  }, [accounts.data, publicKey]);

  return publicKey ? (
    <div className="flex">
      {/* <nav className="sidebar fixed w-64 bg-gray-800 text-white h-screen p-4">
        <h2 className="text-lg font-bold mb-4">Navigation</h2>
        <ul className="list-disc pl-5">
          <li className="mb-2">
            <a href="#create-listing" className="text-white hover:underline">Create Parking Space Listing</a>
          </li>
          <li>
            <a href="#parking-space-list" className="text-white hover:underline">Manage Parking Space Listing</a>
          </li>
        </ul>
      </nav> */}
      <main className="flex-grow ml-64 p-4">
        <AppHero
          title="Welcome Homeowners"
          subtitle={'Rent out your driveway and make money!'}
        >
          <p className="mb-6">
            <ExplorerLink
              path={`account/${programId}`}
              label={ellipsify(programId.toString())}
            />
          </p>
          {!currentAccountListing ? (
            <div id="create-listing">
              <ListingCreate />
            </div>
          ) : (
            <div id="parking-space-list" className="mt-8 ">
              <ListingUpdateDelete />
            </div>
          )}
        </AppHero>
      </main>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <AppHero
            title="Welcome Homeowners"
            subtitle={'Before you can continue, please connect a wallet to create a listing'}
          />
          <WalletButton />
        </div>
      </div>
    </div>
  );
}

import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useCluster } from '@/components/cluster/cluster-provider';
import { useConnection } from '@/components/solana/solana-provider';
import { useMarketplaceProgramAnchor } from './useMarketplaceProgramAnchor';

interface CreateListingArgs {
  address: string;
  rentalRate: number;
  sensorId: string;
  latitude: number;
  longitude: number;
  additionalInfo?: string;
  availabilityStart: number;
  availabilityEnd: number;
  email: string;
  phone: string;
  homeowner1: PublicKey;
}

interface ListingAccount {
  address: string;
  rentalRate: number;
  sensorId: string;
  latitude: number;
  longitude: number;
  additionalInfo?: string | null | undefined;
  availabiltyStart: number;
  availabiltyEnd: number;
  email: string;
  phone: string;
}

export function useMarketplaceProgram() {
  const { account } = useWalletUi();
  const cluster = useCluster();
  const connection = useConnection();
  const queryClient = useQueryClient();

  // Example: Fetch all accounts/listings from the Solana program
  const accounts = useQuery({
    queryKey: ['accounts', cluster.selectedCluster.id],
    queryFn: async () => {
      // Replace with your actual fetch logic if needed
      // Example: return await connection.getProgramAccounts(...);
      return [];
    },
  });

  // Example: Fetch all listings (replace with your actual fetch logic)
  const listings = useQuery({
    queryKey: ['listings', 'all', cluster.selectedCluster.id],
    queryFn: async () => {
      // Replace with your actual fetch logic using connection
      return [];
    },
  });

  const createListing = useMutation<string, Error, CreateListingArgs>({
    mutationFn: async (input) => {
      // Example: Use your connection or utility function here
      // return await connection.sendTransaction(...);
      return 'tx_signature';
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings', 'all', cluster.selectedCluster.id] });
      toast.success('Listing created!');
    },
    onError: (error) => {
      toast.error(`Failed to create a new listing: ${error.message}`);
    },
  });

  return {
    account,
    cluster,
    connection,
    accounts,
    listings,
    createListing,
  };
}

export function useMarketplaceProgramAccount({ account }: { account: PublicKey }) {
  const cluster = useCluster();
  const connection = useConnection();
  const queryClient = useQueryClient();
  const { program } = useMarketplaceProgramAnchor();

  // Example: Fetch a single listing (replace with your actual fetch logic)
  const accountQuery = useQuery<ListingAccount | undefined>({
    queryKey: ['listing', cluster.selectedCluster.id, account],
    queryFn: async () => {
      if (!program || !account) return undefined;
      // Fetch the real listing account using Anchor
      return await program.account.listing.fetch(account);
    },
    enabled: !!program && !!account,
  });

  // Example: Update a listing (replace with your actual mutation logic)
  const updateListing = useMutation<string, Error, Partial<ListingAccount> & { homeowner1: PublicKey }>({
    mutationFn: async (input) => {
      if (!program || !account) throw new Error('Program or account not ready');
      // Call the Anchor updateListing method with the correct arguments and accounts
      // You may need to adjust the arguments to match your IDL
      return await program.methods
        .updateListing(
          input.address ?? null,
          input.rentalRate ?? null,
          input.sensorId ?? null,
          input.latitude ?? null,
          input.longitude ?? null,
          input.additionalInfo ?? null,
          input.availabiltyStart ?? null,
          input.availabiltyEnd ?? null,
          input.email ?? null,
          input.phone ?? null
        )
        .accountsPartial({
          marketplace: /* marketplace public key here */ account, // You must provide the correct marketplace account
          maker: input.homeowner1,
          listing: account,
          owner: input.homeowner1,
          systemProgram: new PublicKey('11111111111111111111111111111111'),
        })
        .rpc();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', cluster.selectedCluster.id, account] });
      toast.success('Listing updated!');
    },
    onError: (error) => {
      toast.error(`Failed to update listing: ${error.message}`);
    },
  });

  // Example: Delete a listing (replace with your actual mutation logic)
  const deleteListing = useMutation({
    mutationFn: async () => {
      // Replace with your actual delete logic using connection
      return {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', cluster.selectedCluster.id, account] });
      toast.success('Listing deleted!');
    },
    onError: (error) => {
      toast.error(`Failed to delete listing: ${error.message}`);
    },
  });

  return {
    accountQuery,
    updateListing,
    deleteListing,
  };
}
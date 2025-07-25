import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useCluster } from '@/components/cluster/cluster-provider';
import { useConnection } from '@/components/solana/solana-provider';

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

  // Example: Fetch a single listing (replace with your actual fetch logic)
  const accountQuery = useQuery({
    queryKey: ['listing', cluster.selectedCluster.id, account],
    queryFn: async () => {
      // Replace with your actual fetch logic using connection
      return {};
    },
  });

  // Example: Update a listing (replace with your actual mutation logic)
  const updateListing = useMutation({
    mutationFn: async (input) => {
      // Replace with your actual update logic using connection
      return {};
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
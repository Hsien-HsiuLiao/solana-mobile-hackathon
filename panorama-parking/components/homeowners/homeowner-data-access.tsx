import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useCluster } from '@/components/cluster/cluster-provider';
import { useConnection } from '@/components/solana/solana-provider';
import { useMarketplaceProgramAnchor } from './useMarketplaceProgramAnchor';
import * as anchor from '@coral-xyz/anchor';

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
  const { account, signAndSendTransaction } = useWalletUi();
  const cluster = useCluster();
  const connection = useConnection();
  const queryClient = useQueryClient();
  const { program } = useMarketplaceProgramAnchor();

  // Example: Fetch all accounts/listings from the Solana program
  const accounts = useQuery<{ account: { maker: PublicKey }, publicKey: PublicKey }[]>({
    queryKey: ['accounts', cluster.selectedCluster.id],
    queryFn: async () => {
      if (!connection || !program) return [];
      // Fetch all program accounts for the listing account type
      const rawAccounts = await program.account.listing.all();
      // Map to the expected structure
      return rawAccounts.map((acc: any) => ({
        account: acc.account,
        publicKey: acc.publicKey,
      }));
    },
    enabled: !!connection && !!program,
  });

  // Example: Fetch all listings (replace with your actual fetch logic)
  const listings = useQuery({
    queryKey: ['listings', 'all', cluster.selectedCluster.id],
    queryFn: async () => {
      // Replace with your actual fetch logic using connection
      return [];
    },
  });

  // Add getProgramAccount query
  const getProgramAccount = useQuery({
    queryKey: ['programAccount', cluster.selectedCluster.id],
    queryFn: async () => {
      // Replace with your actual fetch logic for the program account
      // Example: return await connection.getAccountInfo(programId);
      return { value: null };
    },
  });

  const createListing = useMutation<string, Error, CreateListingArgs>({
    mutationFn: async (input) => {
      if (!program || !account?.publicKey) throw new Error('Program or wallet not ready');
      
      console.log('Creating listing with data:', input);
      
      const marketplace_name = "DePIN PANORAMA PARKING"; // Use the actual marketplace name you created
      
      // Derive the marketplace PDA
      const [marketplace, marketplaceBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
        program.programId
      );
      
      console.log('Marketplace PDA:', marketplace.toString());
      console.log('Marketplace name:', marketplace_name);
      
      // Derive the listing PDA
      const [listing, listingBump] = PublicKey.findProgramAddressSync(
        [marketplace.toBuffer(), input.homeowner1.toBuffer()],
        program.programId
      );
      
      console.log('Listing PDA:', listing.toString());
      
      // Build the transaction using Anchor
      const transaction = await program.methods
        .list(
          input.address,
          input.rentalRate,
          input.sensorId,
          input.latitude,
          input.longitude,
          input.additionalInfo || null,
          new anchor.BN(input.availabilityStart),
          new anchor.BN(input.availabilityEnd),
          input.email,
          input.phone
        )
        .accountsPartial({
          marketplace: marketplace,
          maker: input.homeowner1,
          listing: listing,
          systemProgram: new PublicKey('11111111111111111111111111111111'),
        })
        .transaction();
      
      // Get the latest blockhash
      const latestBlockhash = await connection.getLatestBlockhash();
      
      // Add the recent blockhash to the transaction
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = input.homeowner1;
      
      // Sign and send the transaction using the wallet
      const signature = await signAndSendTransaction(transaction, latestBlockhash.lastValidBlockHeight);
      
      // Confirm the transaction
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');
      
      console.log('Transaction signature:', signature);
      return signature;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings', 'all', cluster.selectedCluster.id] });
      toast.success('Listing created!');
    },
    onError: (error) => {
      console.error('Error creating listing:', error);
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
    getProgramAccount,
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
  const deleteListing = useMutation<string, Error, { homeowner1: PublicKey}>({
    mutationFn: async (input) => {
      if (!program || !account) throw new Error('Program or account not ready');
      return await program.methods
        .deleteListing()
        .accountsPartial({
          marketplace: account, // or the correct marketplace PDA if needed
          maker: input.homeowner1,
          listing: account,
          owner: input.homeowner1,
          systemProgram: new PublicKey('11111111111111111111111111111111'),
        })
        .rpc();
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
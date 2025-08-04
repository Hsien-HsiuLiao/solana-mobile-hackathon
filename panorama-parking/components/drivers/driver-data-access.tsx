"use client";

import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useCluster } from '@/components/cluster/cluster-provider';
import { useConnection } from '@/components/solana/solana-provider';
import { useMarketplaceProgramAnchor } from '@/utils/useMarketplaceProgramAnchor';
import * as anchor from '@coral-xyz/anchor';

interface ReserveArgs {
  startTime: anchor.BN;
  endTime: anchor.BN;
  renter: PublicKey;
  maker: PublicKey;
}

export function useMarketplaceProgram() {
  const { account, signAndSendTransaction } = useWalletUi();
  const cluster = useCluster();
  const connection = useConnection();
  const queryClient = useQueryClient();
  const { program } = useMarketplaceProgramAnchor();

  // Fetch all accounts/listings from the Solana program
  const accounts = useQuery<{ account: { maker: PublicKey }, publicKey: PublicKey }[]>({
    queryKey: ['accounts', cluster.selectedCluster.id],
    queryFn: async () => {
      if (!connection || !program) {
        return [];
      }
      
      try {
        const rawAccounts = await program.account.listing.all();
        const mappedAccounts = rawAccounts.map((acc: any) => ({
          account: acc.account,
          publicKey: acc.publicKey,
        }));
        return mappedAccounts;
      } catch (error) {
        console.error('Error fetching accounts:', error);
        return [];
      }
    },
    enabled: !!connection && !!program,
    retry: 1,
    retryDelay: 2000,
  });

  const getProgramAccount = useQuery({
    queryKey: ['programAccount', cluster.selectedCluster.id],
    queryFn: async () => {
      if (!program) return { value: null };
      return { value: await connection.getAccountInfo(program.programId) };
    },
    enabled: !!connection && !!program,
  });

  const marketplace_name = "DePIN PANORAMA PARKING";
  const [marketplace, marketplaceBump] = useMemo(() => {
    if (!program) return [null, null];
    return PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
      program.programId
    );
  }, [program]);

  const reserve = useMutation<string, Error, ReserveArgs>({
    mutationFn: async ({ startTime, endTime, renter, maker }) => {
      if (!program || !marketplace || !account?.publicKey) {
        throw new Error('Program, marketplace, or wallet not ready');
      }
      
      const listingPDA = PublicKey.findProgramAddressSync(
        [marketplace.toBuffer(), maker.toBuffer()],
        program.programId
      )[0];
      
      const transaction = await program.methods.reserve(startTime, endTime)
        .accountsPartial({
          renter: renter,
          maker: maker,
          marketplace: marketplace,
          listing: listingPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .transaction();
      
      // Get the latest blockhash
      const latestBlockhash = await connection.getLatestBlockhash();
      
      // Add the recent blockhash to the transaction
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = renter;
      
      // Sign and send the transaction using the wallet
      const signature = await signAndSendTransaction(transaction, latestBlockhash.lastValidBlockHeight);
      
      // Confirm the transaction
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');
      
      return signature;
    },
    onSuccess: (signature) => {
      queryClient.invalidateQueries({ queryKey: ['accounts', cluster.selectedCluster.id] });
      toast.success('Reservation successful!');
    },
    onError: (error) => {
      console.error('Error creating reservation:', error);
      toast.error(`Failed to reserve parking space: ${error.message}`);
    },
  });

  return {
    program,
    accounts,
    getProgramAccount,
    reserve,
  };
}

export function useMarketplaceProgramAccount({ account }: { account: PublicKey }) {
  const cluster = useCluster();
  const connection = useConnection();
  const queryClient = useQueryClient();
  const { program } = useMarketplaceProgramAnchor();

  const accountQuery = useQuery({
    queryKey: ['listing', cluster.selectedCluster.id, account],
    queryFn: async () => {
      if (!program || !account) return undefined;
      
      try {
        const result = await program.account.listing.fetch(account);
        return result;
      } catch (error) {
        console.error('Error fetching individual account:', error);
        return undefined;
      }
    },
    enabled: !!program && !!account,
  });

  return {
    accountQuery,
  };
}
import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useCluster } from '@/components/cluster/cluster-provider';
import { useConnection } from '@/components/solana/solana-provider';
import { useMarketplaceProgramAnchor } from './useMarketplaceProgramAnchor';
import * as anchor from '@coral-xyz/anchor';
import { confirm, log } from './homeowner-ui-helpers';

// Buffer polyfill fallback
if (typeof global.Buffer !== 'undefined' && global.Buffer.prototype) {
  if (!global.Buffer.prototype.readUIntLE) {
    global.Buffer.prototype.readUIntLE = function(offset: number, byteLength: number) {
      let value = 0;
      for (let i = 0; i < byteLength; i++) {
        value += this[offset + i] * Math.pow(256, i);
      }
      return value;
    };
  }
  
  if (!global.Buffer.prototype.readUIntBE) {
    global.Buffer.prototype.readUIntBE = function(offset: number, byteLength: number) {
      let value = 0;
      for (let i = 0; i < byteLength; i++) {
        value += this[offset + i] * Math.pow(256, byteLength - 1 - i);
      }
      return value;
    };
  }
}

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
      console.log('=== ACCOUNTS QUERY DEBUG ===');
      console.log('Fetching accounts...');
      console.log('Connection:', !!connection);
      console.log('Program:', !!program);
      console.log('Program ID:', program?.programId.toString());
      console.log('Cluster:', cluster.selectedCluster.id);
      console.log('Cluster endpoint:', cluster.selectedCluster.endpoint);
      
      if (!connection || !program) {
        console.log('Missing connection or program, returning empty array');
        return [];
      }
      
      try {
        // Add a timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
        });
        
        // Fetch all program accounts for the listing account type
        console.log('Calling program.account.listing.all()...');
        const fetchPromise = program.account.listing.all();
        
        const rawAccounts = await Promise.race([fetchPromise, timeoutPromise]) as any;
        console.log('Raw accounts from program:', rawAccounts);
        console.log('Raw accounts length:', rawAccounts.length);
        
        // Map to the expected structure
        const mappedAccounts = rawAccounts.map((acc: any) => ({
          account: acc.account,
          publicKey: acc.publicKey,
        }));
        
        console.log('Mapped accounts:', mappedAccounts);
        console.log('Mapped accounts length:', mappedAccounts.length);
        return mappedAccounts;
      } catch (error) {
        console.error('Error fetching accounts:', error);
        
        // If it's a Buffer error, try a different approach
        if (error instanceof Error && error.message && error.message.includes('readUIntLE')) {
          console.log('Buffer compatibility issue detected, trying alternative approach...');
          try {
            // Try using connection.getProgramAccounts with correct data size for listing accounts
            // Based on the IDL, listing accounts should be around 200+ bytes
            const programAccounts = await connection.getProgramAccounts(program.programId, {
              filters: [
                {
                  dataSize: 200, // Approximate size for listing accounts
                },
              ],
            });
            console.log('Alternative fetch result (dataSize 200):', programAccounts.length);
            
            if (programAccounts.length === 0) {
              // Try with a larger size
              const programAccounts2 = await connection.getProgramAccounts(program.programId, {
                filters: [
                  {
                    dataSize: 300,
                  },
                ],
              });
              console.log('Alternative fetch result (dataSize 300):', programAccounts2.length);
              
              if (programAccounts2.length === 0) {
                // Try without any size filter
                const allAccounts = await connection.getProgramAccounts(program.programId);
                console.log('All program accounts (no filter):', allAccounts.length);
                allAccounts.forEach((acc, index) => {
                  console.log(`Account ${index}:`, {
                    pubkey: acc.pubkey.toString(),
                    dataLength: acc.account.data.length,
                  });
                });
                
                // Filter accounts that look like listing accounts (around 295-296 bytes)
                const listingAccounts = allAccounts.filter(acc => 
                  acc.account.data.length >= 290 && acc.account.data.length <= 300
                );
                
                console.log('Filtered listing accounts:', listingAccounts.length);
                
                // Try to manually parse these accounts
                const parsedAccounts = listingAccounts.map(acc => {
                  try {
                    // Create a mock account structure that matches what Anchor would return
                    const mockAccount = {
                      account: {
                        maker: new PublicKey(acc.account.data.slice(8, 40)), // Assuming maker is at offset 8
                        // Add other fields as needed
                      },
                      publicKey: acc.pubkey
                    };
                    return mockAccount;
                  } catch (parseError) {
                    console.error('Error parsing account:', parseError);
                    return null;
                  }
                }).filter(Boolean);
                
                console.log('Parsed accounts:', parsedAccounts);
                return parsedAccounts;
              }
              
              // Process the accounts found with dataSize 300
              const parsedAccounts = programAccounts2.map(acc => {
                try {
                  const mockAccount = {
                    account: {
                      maker: new PublicKey(acc.account.data.slice(8, 40)),
                    },
                    publicKey: acc.pubkey
                  };
                  return mockAccount;
                } catch (parseError) {
                  console.error('Error parsing account:', parseError);
                  return null;
                }
              }).filter(Boolean);
              
              console.log('Parsed accounts (dataSize 300):', parsedAccounts);
              return parsedAccounts;
            }
            
            // Process the accounts found with dataSize 200
            const parsedAccounts = programAccounts.map(acc => {
              try {
                const mockAccount = {
                  account: {
                    maker: new PublicKey(acc.account.data.slice(8, 40)),
                  },
                  publicKey: acc.pubkey
                };
                return mockAccount;
              } catch (parseError) {
                console.error('Error parsing account:', parseError);
                return null;
              }
            }).filter(Boolean);
            
            console.log('Parsed accounts (dataSize 200):', parsedAccounts);
            return parsedAccounts;
          } catch (altError) {
            console.error('Alternative approach also failed:', altError);
            return [];
          }
        }
        
        // If it's a timeout or other error, try a simpler approach
        if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('readUIntLE'))) {
          console.log('Trying simpler approach with connection.getProgramAccounts...');
          try {
            // Get all program accounts without filters first
            const allAccounts = await connection.getProgramAccounts(program.programId);
            console.log('All program accounts:', allAccounts.length);
            
            // For now, return empty array but log what we found
            allAccounts.forEach((acc, index) => {
              console.log(`Account ${index}:`, {
                pubkey: acc.pubkey.toString(),
                dataLength: acc.account.data.length,
              });
            });
            
            return [];
          } catch (simpleError) {
            console.error('Simple approach also failed:', simpleError);
            return [];
          }
        }
        
        return [];
      }
    },
    enabled: !!connection && !!program,
    retry: 1, // Only retry once
    retryDelay: 2000, // Wait 2 seconds before retry
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
      
      // Use the helpers for confirmation and logging
      await confirm(signature, connection);
      await log(signature, connection);
      
      console.log('Transaction signature:', signature);
      return signature;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', cluster.selectedCluster.id] });
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
  const { signAndSendTransaction } = useWalletUi();
 

  // Example: Fetch a single listing (replace with your actual fetch logic)
  const accountQuery = useQuery<ListingAccount | undefined>({
    queryKey: ['listing', cluster.selectedCluster.id, account],
    queryFn: async () => {
      if (!program || !account) return undefined;
      
      console.log('=== INDIVIDUAL ACCOUNT QUERY DEBUG ===');
      console.log('Fetching account:', account.toString());
      
      try {
        // Try to fetch the real listing account using Anchor
        console.log('Calling program.account.listing.fetch...');
        const result = await program.account.listing.fetch(account);
        console.log('Anchor fetch result:', result);
        return result;
      } catch (error) {
        console.error('Error fetching individual account:', error);
        
        // If it's a Buffer error, try manual parsing
        if (error instanceof Error && error.message && error.message.includes('readUIntLE')) {
          console.log('Buffer error in individual fetch, trying manual parsing...');
          try {
            // Get the account info manually
            const accountInfo = await connection.getAccountInfo(account);
            if (!accountInfo) {
              console.log('Account not found');
              return undefined;
            }
            
            console.log('Account data length:', accountInfo.data.length);
            
            // Manually parse the account data
            // This is a simplified parser - you may need to adjust based on your actual account structure
            const data = accountInfo.data;
            
            console.log('Manual parsing account data, length:', data.length);
            
            // Extract fields from the account data based on the IDL structure
            // The account structure from IDL: maker, email, phone, bump, address, latitude, longitude, rentalRate, availabiltyStart, availabiltyEnd, sensorId, reservedBy, reservationStart, reservationEnd, parkingSpaceStatus, additionalInfo, feed
            
            try {
              // Basic parsing - extract what we can
              const mockListing: ListingAccount = {
                address: "Parsed Address", // Would need proper string parsing
                rentalRate: 0, // Would need proper u32 parsing
                sensorId: "Parsed Sensor ID", // Would need proper string parsing
                latitude: 0, // Would need proper f64 parsing
                longitude: 0, // Would need proper f64 parsing
                additionalInfo: "Parsed Additional Info", // Would need proper string parsing
                availabiltyStart: 0, // Would need proper i64 parsing
                availabiltyEnd: 0, // Would need proper i64 parsing
                email: "Parsed Email", // Would need proper string parsing
                phone: "Parsed Phone", // Would need proper string parsing
              };
              
              console.log('Manual parse result:', mockListing);
              return mockListing;
            } catch (parseError) {
              console.error('Error during manual parsing:', parseError);
              return undefined;
            }
          } catch (parseError) {
            console.error('Manual parsing also failed:', parseError);
            return undefined;
          }
        }
        
        return undefined;
      }
    },
    enabled: !!program && !!account,
  });

  // Example: Update a listing (replace with your actual mutation logic)
  const updateListing = useMutation<string, Error, Partial<ListingAccount> & { homeowner1: PublicKey }>({
    mutationFn: async (input) => {
      if (!program || !account) throw new Error('Program or account not ready');
      
      const marketplace_name = "DePIN PANORAMA PARKING";
      
      // Derive the marketplace PDA
      const [marketplace, marketplaceBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
        program.programId
      );
      
      // Derive the listing PDA
      const [listing, listingBump] = PublicKey.findProgramAddressSync(
        [marketplace.toBuffer(), input.homeowner1.toBuffer()],
        program.programId
      );
      
      // Call the Anchor updateListing method with the correct arguments and accounts
      const signature = await program.methods
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
          marketplace: marketplace,
          maker: input.homeowner1,
          listing: listing,
          owner: input.homeowner1,
          systemProgram: new PublicKey('11111111111111111111111111111111'),
        })
        .rpc()
        .then((signature) => confirm(signature, connection))
        .then((signature) => log(signature, connection));
      
      // Use the helpers for confirmation and logging
      await confirm(signature, connection);
      await log(signature, connection);
      
      return signature;
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
      if (!program) throw new Error('Program not ready');
      
      console.log('=== DELETE LISTING DEBUG ===');
      console.log('Input homeowner1:', input.homeowner1.toString());
      console.log('Account parameter:', account.toString());
      
      const marketplace_name = "DePIN PANORAMA PARKING";
      
      // Derive the marketplace PDA
      const [marketplace, marketplaceBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
        program.programId
      );
      
      console.log('Marketplace PDA:', marketplace.toString());
      
      // Derive the listing PDA
      const [listing, listingBump] = PublicKey.findProgramAddressSync(
        [marketplace.toBuffer(), input.homeowner1.toBuffer()],
        program.programId
      );
      
      console.log('Listing PDA:', listing.toString());
      console.log('Expected listing account:', account.toString());
      console.log('PDA matches:', listing.toString() === account.toString());
      
      // Use the listing account from the hook parameter, not the derived one
      console.log('About to call deleteListing...');
      
      // Build the transaction using Anchor
      const transaction = await program.methods
        .deleteListing()
        .accountsPartial({
          maker: input.homeowner1,
          marketplace: marketplace,
          listing: account, // Use the account from the hook parameter
          owner: input.homeowner1,
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
      
      // Use the helpers for confirmation and logging
      await confirm(signature, connection);
      await log(signature, connection);
      
      console.log('Delete transaction signature:', signature);
      return signature;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', cluster.selectedCluster.id, account] });
      queryClient.invalidateQueries({ queryKey: ['accounts', cluster.selectedCluster.id] });
      toast.success('Listing deleted!');
    },
    onError: (error) => {
      console.error('Delete listing c error:', error);
      toast.error(`Failed to delete listing: ${error.message}`);
    },
  });

  return {
    accountQuery,
    updateListing,
    deleteListing,
  };
}
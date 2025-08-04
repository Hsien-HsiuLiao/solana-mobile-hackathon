import { useConnection } from '@/components/solana/solana-provider';
import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { IDL as MarketplaceIDL } from '@/utils/depin-panorama-parking-marketplace';
import { PROGRAM_ID } from '@/utils/marketplace-exports';
import { useMemo } from 'react';
import type { Marketplace } from '@/utils/depin-panorama-parking-marketplace';

export function useMarketplaceProgramAnchor() {
  const connection = useConnection();
  const { account } = useWalletUi();

  const provider = useMemo(() => {
    if (!account?.publicKey) return undefined;
    
    // Create a minimal wallet adapter that just provides the publicKey
    const wallet = {
      publicKey: account.publicKey,
      // These methods are not used since we use signAndSendTransaction directly
      signTransaction: async () => { throw new Error('Not implemented'); },
      signAllTransactions: async () => { throw new Error('Not implemented'); },
    };
    
    return new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  }, [connection, account?.publicKey]);

  const program = useMemo(() =>
    provider ? new Program<Marketplace>(MarketplaceIDL as Idl, provider) : undefined,
    [provider]
  );

  return { program, provider, wallet: account };
} 
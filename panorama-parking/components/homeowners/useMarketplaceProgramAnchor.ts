import { useConnection } from '@/components/solana/solana-provider';
import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { IDL as MarketplaceIDL } from '@/utils/depin-panorama-parking-marketplace';
import { PROGRAM_ID } from '@/utils/marketplace-exports';
import { useMemo } from 'react';
import type { Marketplace } from '@/utils/depin-panorama-parking-marketplace';


// Anchor-compatible wallet adapter from useWalletUi
function useAnchorWallet() {
  const { account } = useWalletUi();
  if (!account) return undefined;
  return {
    publicKey: account.publicKey,
    signTransaction: async (tx) => {
      throw new Error('signTransaction not implemented');
    },
    signAllTransactions: async (txs) => {
      throw new Error('signAllTransactions not implemented');
    },
  };
}

export function useMarketplaceProgramAnchor() {
  const connection = useConnection();
  const wallet = useAnchorWallet();

  const provider = useMemo(() =>
    wallet ? new AnchorProvider(connection, wallet, { commitment: 'confirmed' }) : undefined,
    [connection, wallet]
  );

  const program = useMemo(() =>
    provider ? new Program<Marketplace>(MarketplaceIDL as Idl, provider) : undefined,
    [provider]
  );

  return { program, provider, wallet };
} 
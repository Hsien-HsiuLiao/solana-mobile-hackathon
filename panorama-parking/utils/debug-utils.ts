import { PublicKey } from '@solana/web3.js';

export interface DeleteDebugInfo {
  publicKey: string;
  hasData: boolean;
  isPending: boolean;
  error: string | null;
  address: string | null;
}

export const debugDeleteButton = {
  logButtonPress: (publicKey: PublicKey | null, accountData: any, isPending: boolean, error: any) => {
    console.log('=== DELETE BUTTON DEBUG ===');
    console.log('Delete button pressed');
    console.log('publicKey:', publicKey?.toString());
    console.log('accountQuery.data:', accountData);
    console.log('deleteListing.isPending:', isPending);
    console.log('deleteListing.error:', error);
  },

  logTitleCheck: (title: string | null) => {
    console.log('Title for deletion:', title);
  },

  logMutationCall: () => {
    console.log('Calling deleteListing.mutateAsync...');
  },

  logMutationSuccess: (result: any) => {
    console.log('Delete mutation success:', result);
  },

  logMutationError: (error: any) => {
    console.error('Delete mutation error:', error);
  },

  logNoTitle: () => {
    console.log('No title found, not calling delete');
  },

  getDebugInfo: (publicKey: PublicKey | null, accountData: any, isPending: boolean, error: any): DeleteDebugInfo => {
    return {
      publicKey: publicKey?.toString().slice(0, 8) + '...' || 'Not available',
      hasData: !!accountData,
      isPending,
      error: error?.message || null,
      address: accountData?.address || null,
    };
  }
};

export const debugUtils = {
  log: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  },

  error: (message: string, error?: any) => {
    if (__DEV__) {
      console.error(`[DEBUG ERROR] ${message}`, error || '');
    }
  },

  warn: (message: string, data?: any) => {
    if (__DEV__) {
      console.warn(`[DEBUG WARN] ${message}`, data || '');
    }
  }
}; 
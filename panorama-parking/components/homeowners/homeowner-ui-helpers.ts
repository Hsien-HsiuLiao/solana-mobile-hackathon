// helpers for homeowners

import * as anchor from '@coral-xyz/anchor';
import { useConnection } from '@/components/solana/solana-provider';

// Helper to convert ISO string to unix timestamp (seconds)
export function toUnixTime(dateString: string): anchor.BN {
  if (!dateString) return new anchor.BN(0);
  return new anchor.BN(Math.floor(new Date(dateString).getTime() / 1000));
}

// Helper to convert SOL to lamports
export function solToLamports(sol: number): number {
  if (isNaN(sol)) return 0;
  return Math.round(sol * 1_000_000_000);
}

export function isFormValid({
  address,
  rentalRate,
  sensorId,
  latitude,
  longitude,
  additionalInfo, // not required, but included for completeness
  availabilityStart,
  availabilityEnd,
  email,
  phone,
}: {
  address: string;
  rentalRate: number;
  sensorId: string;
  latitude: number;
  longitude: number;
  additionalInfo?: string;
  availabilityStart: string;
  availabilityEnd: string;
  email: string;
  phone: string;
}): boolean {
  return (
    address.trim() !== "" &&
    solToLamports(rentalRate) > 1 &&
    sensorId.trim() !== "" &&
    Number(latitude) !== 0 &&
    Number(longitude) !== 0 &&
    availabilityStart !== "" &&
    availabilityEnd !== "" &&
    email.trim() !== "" &&
    phone.trim() !== ""
  );
} 

 //helpers
export const confirm = async (signature: string, connection: any): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block,
    });
    return signature;
  };

export const log = async (signature: string, connection: any): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };
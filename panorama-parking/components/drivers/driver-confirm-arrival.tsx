import { PublicKey } from "@solana/web3.js";
import { useMarketplaceProgram } from "./driver-data-access";
import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from 'react-native-paper';
import { useAppTheme } from '@/components/app-theme';

interface ConfirmArrivalButtonProps {
  account: PublicKey;
  maker: PublicKey;
  sensorId: string;
}

export function ConfirmArrivalButton({ account, maker, sensorId }: ConfirmArrivalButtonProps) {
  const { program } = useMarketplaceProgram();
  const { account: walletAccount } = useWalletUi();
  const publicKey = walletAccount?.publicKey;
  const { spacing } = useAppTheme();

  const confirmParking = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!program) {
      toast.error('Program not available');
      return;
    }

    console.log('Starting confirm parking process...');
    console.log('Current user public key:', publicKey.toString());

    try {
      // Find marketplace PDA
      const marketplace_name = "DePIN PANORAMA PARKING";
      const [marketplace] = PublicKey.findProgramAddressSync(
        [Buffer.from("marketplace"), Buffer.from(marketplace_name)],
        program.programId
      );

      // Find listing PDA
      const [listing] = PublicKey.findProgramAddressSync(
        [marketplace.toBuffer(), maker.toBuffer()],
        program.programId
      );

      console.log('PDAs derived:', {
        marketplace: marketplace.toString(),
        listing: listing.toString()
      });

      // Get the listing data to check sensor ID and calculate transfer amount
      const listingData = await program.account.listing.fetch(listing);
      
      console.log('Listing data fetched:', {
        reservedBy: listingData.reservedBy?.toString(),
        sensorId: listingData.sensorId,
        currentUser: publicKey.toString()
      });
      
      // Log reservation times for debugging
      console.log('Reservation times:', {
        reservationStart: listingData.reservationStart?.toString(),
        reservationEnd: listingData.reservationEnd?.toString(),
        reservationStartDate: listingData.reservationStart ? new Date(Number(listingData.reservationStart) * 1000).toISOString() : 'N/A',
        reservationEndDate: listingData.reservationEnd ? new Date(Number(listingData.reservationEnd) * 1000).toISOString() : 'N/A',
        durationSeconds: listingData.reservationEnd && listingData.reservationStart ? Number(listingData.reservationEnd) - Number(listingData.reservationStart) : 'N/A',
        durationHours: listingData.reservationEnd && listingData.reservationStart ? (Number(listingData.reservationEnd) - Number(listingData.reservationStart)) / 3600 : 'N/A'
      });
      
      // Check if the current user is the one who reserved this parking space
      if (listingData.reservedBy?.toString() !== publicKey.toString()) {
        toast.error('Only the person who reserved this parking space can confirm arrival');
        console.error('Reservation mismatch:', {
          reservedBy: listingData.reservedBy?.toString(),
          currentUser: publicKey.toString()
        });
        return;
      }
      
      console.log('Reservation check passed');
      
      // Check if sensor ID matches
      if (listingData.sensorId !== sensorId) {
        toast.error(`Sensor ID mismatch. Expected: ${listingData.sensorId}, Provided: ${sensorId}`);
        return;
      }

      console.log('Sensor ID check passed');

      // Calculate expected transfer amount
      const duration = Number(listingData.reservationEnd) - Number(listingData.reservationStart);
      const ratePerHour = Number(listingData.rentalRate);
      const reservationAmount = Math.floor((duration / 3600) * ratePerHour);
      
      // Get marketplace data to get the fee
      const marketplaceData = await program.account.marketplace.fetch(marketplace);
      const marketplaceFee = Number(marketplaceData.fee);
      
      console.log('Marketplace data:', {
        marketplace: marketplace.toString(),
        fee: marketplaceData.fee.toString(),
        feeLamports: Number(marketplaceData.fee),
        feeSOL: Number(marketplaceData.fee) / LAMPORTS_PER_SOL
      });

      // Calculate total amount to transfer (reservation amount + marketplace fee)
      const totalTransferAmount = reservationAmount + marketplaceFee;
      
      console.log('Transfer calculations:', {
        duration,
        ratePerHour,
        reservationAmount,
        marketplaceFee,
        totalTransferAmount,
        reservationAmountSOL: reservationAmount / LAMPORTS_PER_SOL,
        marketplaceFeeSOL: marketplaceFee / LAMPORTS_PER_SOL,
        totalTransferAmountSOL: totalTransferAmount / LAMPORTS_PER_SOL
      });

      // Call the confirmParking instruction
      const signature = await program.methods.confirmParking(sensorId)
        .accountsPartial({
          renter: publicKey,
          maker: maker,
          marketplace: marketplace,
          listing: listing,
          systemProgram: PublicKey.findProgramAddressSync([], new PublicKey('11111111111111111111111111111111'))[0], // System program
        })
        .rpc();

      console.log('Confirm parking transaction successful:', signature);
      toast.success('Arrival confirmed! Parking space is now occupied.');
      
    } catch (error) {
      console.error('Error confirming parking:', error);
      toast.error(`Failed to confirm arrival: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleConfirmArrival = () => {
    confirmParking();
  };

  return (
    <Button
      mode="contained"
      onPress={handleConfirmArrival}
      style={{ marginTop: spacing.sm }}
    >
      Confirm Arrival
    </Button>
  );
}
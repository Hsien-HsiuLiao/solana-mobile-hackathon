"use client";

import * as anchor from '@coral-xyz/anchor';
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ellipsify } from '@/utils/ellipsify';
import { useMarketplaceProgram, useMarketplaceProgramAccount } from "./driver-data-access";
import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import { ConfirmArrivalButton } from './driver-confirm-arrival';
import { GpsNavigationButton } from './driver-gps-navigation';
import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/components/app-theme';
import { Card, Button, TextInput, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { ScrollView, Modal, View } from 'react-native';

function DebugTable({ accounts }: { accounts: { publicKey: PublicKey; account: any }[] }) {
  const { spacing } = useAppTheme();
  
  return (
    <AppView style={{ marginBottom: spacing.lg, padding: spacing.md, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' }}>
      <AppText variant="titleMedium" style={{ marginBottom: spacing.sm, color: '#000000', fontWeight: 'bold', fontSize: 16 }}>
        Overview: All Listings Status
      </AppText>
      <ScrollView horizontal>
        <AppView style={{ minWidth: 600 }}>
          {accounts.map((account) => (
            <DebugTableRow key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </AppView>
      </ScrollView>
    </AppView>
  );
}

function DebugTableRow({ account }: { account: PublicKey }) {
  const { accountQuery } = useMarketplaceProgramAccount({ account });
  const { spacing } = useAppTheme();
  
  if (accountQuery.isLoading) {
    return (
      <AppView style={{ padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: '#fafafa' }}>
        <AppText variant="bodyMedium" style={{ fontFamily: 'monospace', color: '#000000', fontSize: 14 }}>{ellipsify(account.toString())}</AppText>
        <AppText variant="bodyMedium" style={{ color: '#000000', fontSize: 14 }}>Loading...</AppText>
      </AppView>
    );
  }
  
  const status = accountQuery.data?.parkingSpaceStatus ? JSON.stringify(accountQuery.data.parkingSpaceStatus) : 'No status';
  const address = accountQuery.data?.address || 'No address';
  const reservedBy = accountQuery.data?.reservedBy ? ellipsify(accountQuery.data.reservedBy.toString()) : 'Not reserved';
  const createdBy = accountQuery.data?.maker ? ellipsify(accountQuery.data.maker.toString()) : 'Unknown';
  
  return (
    <AppView style={{ padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: '#ffffff' }}>
      <AppText variant="bodyMedium" style={{ color: '#000000', fontSize: 14 }}>
        Created by: <AppText variant="bodyMedium" style={{ fontFamily: 'monospace', color: '#000000', fontSize: 14, fontWeight: 'bold' }}>{createdBy}</AppText>
      </AppText>
      <AppText variant="bodyMedium" style={{ color: '#000000', fontSize: 14 }}>{address}</AppText>
      <AppText variant="bodyMedium" style={{ fontFamily: 'monospace', color: '#000000', fontSize: 14 }}>{status}</AppText>
      <AppText variant="bodyMedium" style={{ color: '#000000', fontSize: 14 }}>
        Reserved by: <AppText variant="bodyMedium" style={{ fontFamily: 'monospace', color: '#000000', fontSize: 14, fontWeight: 'bold' }}>{reservedBy}</AppText>
      </AppText>
    </AppView>
  );
}

export function ParkingSpaceList() {
  const { accounts, getProgramAccount } = useMarketplaceProgram();
  const { account } = useWalletUi();
  const publicKey = account?.publicKey;
  const { spacing } = useAppTheme();
  const [userHasReservations, setUserHasReservations] = useState(false);

  // Check if user has any reservations
  useEffect(() => {
    if (!publicKey || !accounts.data) {
      setUserHasReservations(false);
      return;
    }

    const hasAnyReservation = accounts.data.some((account: any) => {
      const status = account.account?.parkingSpaceStatus;
      const reservedBy = account.account?.reservedBy;
      
      return (status && ('reserved' in status || 'occupied' in status)) && 
             reservedBy?.toString() === publicKey.toString();
    });

    setUserHasReservations(hasAnyReservation);
  }, [publicKey, accounts.data]);

  if (getProgramAccount.isLoading) {
    return <ActivityIndicator size="large" />;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <AppView style={{ justifyContent: 'center', alignItems: 'center', padding: spacing.md }}>
        <AppText variant="bodyMedium" style={{ textAlign: 'center' }}>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </AppText>
      </AppView>
    );
  }

  // Filter accounts based on user's reservation status
  const filteredAccounts = accounts.data?.filter((account: any) => {
    if (!account.account || !account.account.parkingSpaceStatus) {
      return false;
    }
    
    const status = account.account.parkingSpaceStatus;
    const reservedBy = account.account.reservedBy;
    
    if (userHasReservations) {
      // If user has reservations, show only their reserved/occupied listings
      return (status && ('reserved' in status || 'occupied' in status)) && 
             reservedBy?.toString() === publicKey?.toString();
    } else {
      // If user has no reservations, show only available listings
      return status && typeof status === 'object' && 'available' in status;
    }
  }) || [];

  // Show wallet connection message if no wallet is connected
  if (!publicKey) {
    return (
      <AppView style={{ alignItems: 'center', gap: spacing.md }}>
        <AppView style={{ alignItems: 'center', padding: spacing.lg, backgroundColor: '#333', borderRadius: 8, maxWidth: 300 }}>
          <AppText variant="titleLarge" style={{ color: '#fff', marginBottom: spacing.sm }}>
            Connect Your Wallet
          </AppText>
          <AppText variant="bodyMedium" style={{ color: '#ccc', marginBottom: spacing.md, textAlign: 'center' }}>
            Please connect your wallet to view and reserve available parking spaces.
          </AppText>
          <AppText variant="bodySmall" style={{ color: '#999', textAlign: 'center' }}>
            Available parking spaces will appear here once connected.
          </AppText>
        </AppView>
      </AppView>
    );
  }

  return (
    <AppView style={{ alignItems: 'center', gap: spacing.md }}>
      {/* Debug table */}
      <AppView style={{ marginBottom: spacing.md, padding: spacing.sm, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' }}>
        <AppText variant="titleMedium" style={{ marginBottom: spacing.sm, color: '#000000', fontWeight: 'bold', fontSize: 14 }}>
          All Listings ({accounts.data?.length || 0})
        </AppText>
        {accounts.data?.map((account: any, index: number) => (
          <DebugTableRow key={account.publicKey.toString()} account={account.publicKey} />
        ))}
      </AppView>
      
      {accounts.isLoading ? (
        <ActivityIndicator size="large" />
      ) : filteredAccounts.length ? (
        <AppView style={{ gap: spacing.md, width: '100%' }}>
          {filteredAccounts.map((account: any) => (
            <ListingCard
              key={account.publicKey.toString()}
              account={account.publicKey}
              userHasReservations={userHasReservations}
              setUserHasReservations={setUserHasReservations}
            />
          ))}
        </AppView>
      ) : (
        <AppView style={{ alignItems: 'center' }}>
          <AppText variant="titleLarge">No listings available</AppText>
          <AppText variant="bodyMedium" style={{ opacity: 0.7, marginTop: spacing.xs, textAlign: 'center' }}>
            {accounts.isLoading ? "Retrieving listings..." : "No parking spaces are currently available for reservation."}
          </AppText>
        </AppView>
      )}
    </AppView>
  );
}

function ListingCard({ account, userHasReservations, setUserHasReservations }: { account: PublicKey; userHasReservations: boolean; setUserHasReservations: (value: boolean) => void }) {
  const { accountQuery } = useMarketplaceProgramAccount({ account });
  const { reserve } = useMarketplaceProgram();
  const { account: walletAccount } = useWalletUi();
  const publicKey = walletAccount?.publicKey;
  const { spacing } = useAppTheme();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Custom date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isEditingStart, setIsEditingStart] = useState(true);
  
  // Date objects for the pickers
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000));

  // Helper to convert datetime to unix timestamp
  const toUnixTime = (dateString: string): anchor.BN => {
    if (!dateString) return new anchor.BN(0);
    return new anchor.BN(Math.floor(new Date(dateString).getTime() / 1000));
  };

  // Helper functions for date picker
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Custom date picker functions
  const openDatePicker = (isStart: boolean) => {
    setIsEditingStart(isStart);
    setShowDatePicker(true);
  };

  const openTimePicker = (isStart: boolean) => {
    setIsEditingStart(isStart);
    setShowTimePicker(true);
  };

  const handleReserve = async () => {
    if (!publicKey || !accountQuery.data) return;
    
    // Check if listing is available before attempting to reserve
    const isListingAvailable = accountQuery.data?.parkingSpaceStatus && 
      'available' in accountQuery.data.parkingSpaceStatus;
    
    if (!isListingAvailable) {
      console.error('Cannot reserve: Listing is not available. Status:', accountQuery.data?.parkingSpaceStatus);
      alert('This parking space is not available for reservation.');
      return;
    }

    // Validate that input date/time is within availability window
    if (!startTime || !endTime) {
      alert('Please select both start and end times for your reservation.');
      return;
    }

    const reservationStart = new Date(startTime).getTime() / 1000;
    const reservationEnd = new Date(endTime).getTime() / 1000;
    const listingAvailabilityStart = Number(accountQuery.data.availabiltyStart);
    const listingAvailabilityEnd = Number(accountQuery.data.availabiltyEnd);

    // Check if reservation is within availability window
    if (reservationStart < listingAvailabilityStart) {
      alert(`Reservation start time must be after ${new Date(listingAvailabilityStart * 1000).toLocaleString()}`);
      return;
    }

    if (reservationEnd > listingAvailabilityEnd) {
      alert(`Reservation end time must be before ${new Date(listingAvailabilityEnd * 1000).toLocaleString()}`);
      return;
    }

    // Check if reservation duration is valid
    if (reservationEnd <= reservationStart) {
      alert('Reservation end time must be after start time.');
      return;
    }
    
    try {
      await reserve.mutateAsync({
        startTime: toUnixTime(startTime),
        endTime: toUnixTime(endTime),
        renter: publicKey,
        maker: accountQuery.data.maker,
      });
      setUserHasReservations(true);
    } catch (error) {
      console.error('Reservation failed:', error);
      alert('Reservation failed. Please try again.');
    }
  };

  // Check reservation status
  const hasReservation = accountQuery.data?.parkingSpaceStatus && 
    'reserved' in accountQuery.data.parkingSpaceStatus && 
    accountQuery.data.reservedBy?.toString() === publicKey?.toString();
  
  const isAvailable = accountQuery.data?.parkingSpaceStatus && 
    'available' in accountQuery.data.parkingSpaceStatus;
  
  const isOccupied = accountQuery.data?.parkingSpaceStatus && 
    'occupied' in accountQuery.data.parkingSpaceStatus && 
    accountQuery.data.reservedBy?.toString() === publicKey?.toString();
  
  // Don't filter while data is loading
  if (accountQuery.isLoading) {
    return null;
  }
  
  // Filtering logic - show only user's reservations or available listings
  if (userHasReservations || hasReservation || isOccupied) {
    // If user has any reservations, only show their reserved/occupied listings
    if (!hasReservation && !isOccupied) {
      return null;
    }
  } else {
    // If user has no reservations, only show available listings
    if (!isAvailable) {
      return null;
    }
  }

  const getStatusColor = () => {
    if (accountQuery.data?.parkingSpaceStatus && 'available' in accountQuery.data.parkingSpaceStatus) {
      return '#4caf50';
    } else if (accountQuery.data?.parkingSpaceStatus && 'reserved' in accountQuery.data.parkingSpaceStatus) {
      return '#ff9800';
    } else if (accountQuery.data?.parkingSpaceStatus && 'occupied' in accountQuery.data.parkingSpaceStatus) {
      return '#f44336';
    }
    return '#9e9e9e';
  };

  const getStatusText = () => {
    if (accountQuery.data?.parkingSpaceStatus && 'available' in accountQuery.data.parkingSpaceStatus) {
      return 'Available';
    } else if (accountQuery.data?.parkingSpaceStatus && 'reserved' in accountQuery.data.parkingSpaceStatus) {
      return 'Reserved';
    } else if (accountQuery.data?.parkingSpaceStatus && 'occupied' in accountQuery.data.parkingSpaceStatus) {
      return 'Occupied';
    }
    return 'Unknown';
  };

  return (
    <>
      <Card style={{ marginBottom: spacing.md, backgroundColor: '#ffffff', elevation: 4 }}>
      <Card.Content style={{ padding: spacing.lg }}>
        <AppView style={{ gap: spacing.sm }}>
          <AppView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs }}>
            <AppText variant="titleMedium" style={{ fontWeight: 'bold', color: '#000000', fontSize: 16 }}>
              Created by:
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000000', flex: 1, textAlign: 'right', fontSize: 16 }}>
              {accountQuery.data?.maker ? ellipsify(accountQuery.data.maker.toString()) : 'Unknown'}
            </AppText>
          </AppView>
          
          <AppView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs }}>
            <AppText variant="titleMedium" style={{ fontWeight: 'bold', color: '#000000', fontSize: 16 }}>
              Home Address:
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000000', flex: 1, textAlign: 'right', fontSize: 16 }}>
              {accountQuery.data?.address}
            </AppText>
          </AppView>
          
          <AppView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs }}>
            <AppText variant="titleMedium" style={{ fontWeight: 'bold', color: '#000000', fontSize: 16 }}>
              Status:
            </AppText>
            <AppView style={{ 
              backgroundColor: getStatusColor(), 
              paddingHorizontal: spacing.sm, 
              paddingVertical: spacing.xs, 
              borderRadius: 6 
            }}>
              <AppText variant="bodySmall" style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>
                {getStatusText()}
              </AppText>
            </AppView>
          </AppView>
          
          <AppView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs }}>
            <AppText variant="titleMedium" style={{ fontWeight: 'bold', color: '#000000', fontSize: 16 }}>
              Rental Rate:
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: 16 }}>
              {(accountQuery.data?.rentalRate ?? 0) / LAMPORTS_PER_SOL} SOL
            </AppText>
          </AppView>
          
          <AppView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs }}>
            <AppText variant="titleMedium" style={{ fontWeight: 'bold', color: '#000000', fontSize: 16 }}>
              Available From:
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000000', fontSize: 16 }}>
              {accountQuery.data?.availabiltyStart ? dayjs.unix(Number(accountQuery.data.availabiltyStart)).format('YYYY-MM-DD HH:mm') : 'N/A'}
            </AppText>
          </AppView>
          
          <AppView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs }}>
            <AppText variant="titleMedium" style={{ fontWeight: 'bold', color: '#000000', fontSize: 16 }}>
              Available Until:
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000000', fontSize: 16 }}>
              {accountQuery.data?.availabiltyEnd ? dayjs.unix(Number(accountQuery.data.availabiltyEnd)).format('YYYY-MM-DD HH:mm') : 'N/A'}
            </AppText>
          </AppView>
          
          <AppView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: spacing.xs }}>
            <AppText variant="titleMedium" style={{ fontWeight: 'bold', color: '#000000', fontSize: 16 }}>
              Additional Info:
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000000', flex: 1, textAlign: 'right', fontSize: 16 }}>
              {accountQuery.data?.additionalInfo || 'None'}
            </AppText>
          </AppView>
          
          <AppView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs }}>
            <AppText variant="titleMedium" style={{ fontWeight: 'bold', color: '#000000', fontSize: 16 }}>
              Email:
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000000', flex: 1, textAlign: 'right', fontSize: 16 }}>
              {accountQuery.data?.email}
            </AppText>
          </AppView>
          
          <AppView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs }}>
            <AppText variant="titleMedium" style={{ fontWeight: 'bold', color: '#000000', fontSize: 16 }}>
              Phone:
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000000', flex: 1, textAlign: 'right', fontSize: 16 }}>
              {accountQuery.data?.phone}
            </AppText>
          </AppView>
        </AppView>

        {publicKey && (
          <AppView style={{ marginTop: spacing.md, padding: spacing.md, backgroundColor: '#e3f2fd', borderRadius: 8 }}>
            {hasReservation ? (
              <AppView style={{ gap: spacing.sm }}>
                <AppText variant="titleMedium" style={{ color: '#000000', fontWeight: 'bold' }}>
                  Your Reservation
                </AppText>
                <AppView style={{ padding: spacing.sm, backgroundColor: '#e8f5e8', borderRadius: 4 }}>
                  <AppText variant="bodyMedium" style={{ color: '#000000' }}>
                    Total Cost: <AppText variant="bodyMedium" style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                      {(() => {
                        const start = accountQuery.data?.reservationStart;
                        const end = accountQuery.data?.reservationEnd;
                        const rate = accountQuery.data?.rentalRate;
                        
                        if (start && end && rate) {
                          const durationHours = (Number(end) - Number(start)) / 3600;
                          const totalCost = (durationHours * Number(rate)) / LAMPORTS_PER_SOL;
                          return `${totalCost.toFixed(4)} SOL`;
                        }
                        return 'Calculating...';
                      })()}
                    </AppText>
                  </AppText>
                </AppView>
                <AppText variant="bodyMedium" style={{ color: '#000000' }}>
                  Reservation Start: {accountQuery.data?.reservationStart ? dayjs.unix(Number(accountQuery.data.reservationStart)).format('YYYY-MM-DD HH:mm') : 'N/A'}
                </AppText>
                <AppText variant="bodyMedium" style={{ color: '#000000' }}>
                  Reservation End: {accountQuery.data?.reservationEnd ? dayjs.unix(Number(accountQuery.data.reservationEnd)).format('YYYY-MM-DD HH:mm') : 'N/A'}
                </AppText>
                <AppText variant="bodyMedium" style={{ color: '#000000' }}>
                  Status: <AppText variant="bodyMedium" style={{ color: '#2e7d32', fontWeight: 'bold' }}>Reserved</AppText>
                </AppText>
                <AppText variant="bodyMedium" style={{ color: '#000000' }}>
                  Reserved by: {accountQuery.data?.reservedBy ? ellipsify(accountQuery.data.reservedBy.toString()) : 'N/A'}
                </AppText>
              </AppView>
            ) : (
              <AppView style={{ gap: spacing.sm }}>
                <AppText variant="titleMedium" style={{ color: '#000000', fontWeight: 'bold' }}>
                  Reservation Duration
                </AppText>
                <AppView style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <AppText variant="titleMedium" style={{ color: '#000000', fontWeight: 'bold' }}>Start Time</AppText>
                  <Button 
                    mode="text" 
                    compact
                    textColor="#000000"
                    onPress={() => {
                      const now = new Date();
                      setStartDateTime(now);
                      setStartTime(now.toISOString());
                    }}
                  >
                    Quick Select
                  </Button>
                </AppView>
                <AppView style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <AppView style={{ flex: 1 }}>
                    <Button
                      mode="outlined"
                      textColor="#000000"
                      onPress={() => openDatePicker(true)}
                      style={{ justifyContent: 'flex-start' }}
                    >
                      {formatDate(startDateTime)}
                    </Button>
                  </AppView>
                  <AppView style={{ flex: 1 }}>
                    <Button
                      mode="outlined"
                      textColor="#000000"
                      onPress={() => openTimePicker(true)}
                      style={{ justifyContent: 'flex-start' }}
                    >
                      {formatTime(startDateTime)}
                    </Button>
                  </AppView>
                </AppView>
                <AppText variant="bodySmall" style={{ color: '#666', marginTop: spacing.xs }}>
                  Selected: {startDateTime.toLocaleString()}
                </AppText>

                <AppView style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <AppText variant="titleMedium" style={{ color: '#000000', fontWeight: 'bold' }}>End Time</AppText>
                  <Button 
                    mode="text" 
                    compact
                    textColor="#000000"
                    onPress={() => {
                      const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
                      setEndDateTime(endTime);
                      setEndTime(endTime.toISOString());
                    }}
                  >
                    Quick Select
                  </Button>
                </AppView>
                <AppView style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <AppView style={{ flex: 1 }}>
                    <Button
                      mode="outlined"
                      textColor="#000000"
                      onPress={() => openDatePicker(false)}
                      style={{ justifyContent: 'flex-start' }}
                    >
                      {formatDate(endDateTime)}
                    </Button>
                  </AppView>
                  <AppView style={{ flex: 1 }}>
                    <Button
                      mode="outlined"
                      textColor="#000000"
                      onPress={() => openTimePicker(false)}
                      style={{ justifyContent: 'flex-start' }}
                    >
                      {formatTime(endDateTime)}
                    </Button>
                  </AppView>
                </AppView>
                <AppText variant="bodySmall" style={{ color: '#666', marginTop: spacing.xs }}>
                  Selected: {endDateTime.toLocaleString()}
                </AppText>
                <Button
                  mode="contained"
                  textColor="#ffffff"
                  onPress={handleReserve}
                  disabled={!startTime || !endTime || reserve.isPending}
                  loading={reserve.isPending}
                  style={{ marginTop: spacing.sm }}
                >
                  {reserve.isPending ? "Reserving..." : "Reserve"}
                </Button>
              </AppView>
            )}
          </AppView>
        )}

        {publicKey && hasReservation && (
          <AppView style={{ marginTop: spacing.md, gap: spacing.sm }}>
            <AppText variant="titleMedium" style={{ color: '#000000', fontWeight: 'bold' }}>Step 2: Navigate to Location</AppText>
            <GpsNavigationButton 
              address={accountQuery.data?.address || ''}
              latitude={accountQuery.data?.latitude || 0}
              longitude={accountQuery.data?.longitude || 0}
            />
            <AppText variant="titleMedium" style={{ color: '#000000', fontWeight: 'bold' }}>Step 3: Confirm Arrival</AppText>
            <ConfirmArrivalButton 
              account={account} 
              maker={accountQuery.data?.maker || new PublicKey('11111111111111111111111111111111')}
              sensorId={accountQuery.data?.sensorId || ''}
            />
          </AppView>
        )}

        {publicKey && isOccupied && (
          <AppView style={{ marginTop: spacing.md, padding: spacing.md, backgroundColor: '#fff3e0', borderRadius: 8 }}>
            <AppText variant="titleMedium">Step 4: Driver Left</AppText>
            <AppText variant="bodyMedium" style={{ color: '#e65100', fontWeight: 'bold' }}>
              Driver has left the parking space
            </AppText>
            <AppText variant="bodySmall" style={{ color: '#f57c00', marginTop: spacing.xs }}>
              The homeowner will simulate the sensor change
            </AppText>
          </AppView>
        )}
      </Card.Content>
    </Card>

    {/* Custom Date/Time Picker Modal */}
    <Modal
      visible={showDatePicker || showTimePicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        setShowDatePicker(false);
        setShowTimePicker(false);
      }}
    >
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0.5)' 
      }}>
        <View style={{ 
          backgroundColor: 'white', 
          padding: spacing.lg, 
          borderRadius: 12, 
          width: '90%',
          maxWidth: 400
        }}>
          <AppText variant="titleLarge" style={{ marginBottom: spacing.md, textAlign: 'center' }}>
            {showDatePicker ? 'Select Date' : 'Select Time'}
          </AppText>
          
          {showDatePicker && (
            <AppView style={{ gap: spacing.md }}>
              <SegmentedButtons
                value={isEditingStart ? 'start' : 'end'}
                onValueChange={(value) => setIsEditingStart(value === 'start')}
                buttons={[
                  { value: 'start', label: 'Start Date' },
                  { value: 'end', label: 'End Date' }
                ]}
              />
              
              <AppView style={{ flexDirection: 'row', gap: spacing.sm }}>
                <AppView style={{ flex: 1 }}>
                  <TextInput
                    mode="outlined"
                    label="Year"
                    keyboardType="numeric"
                    value={isEditingStart ? startDateTime.getFullYear().toString() : endDateTime.getFullYear().toString()}
                    onChangeText={(text) => {
                      const year = parseInt(text) || new Date().getFullYear();
                      if (isEditingStart) {
                        const newDate = new Date(startDateTime);
                        newDate.setFullYear(year);
                        setStartDateTime(newDate);
                        setStartTime(newDate.toISOString());
                      } else {
                        const newDate = new Date(endDateTime);
                        newDate.setFullYear(year);
                        setEndDateTime(newDate);
                        setEndTime(newDate.toISOString());
                      }
                    }}
                  />
                </AppView>
                <AppView style={{ flex: 1 }}>
                  <TextInput
                    mode="outlined"
                    label="Month"
                    keyboardType="numeric"
                    value={(isEditingStart ? startDateTime.getMonth() : endDateTime.getMonth()) + 1 + ''}
                    onChangeText={(text) => {
                      const month = (parseInt(text) || 1) - 1;
                      if (isEditingStart) {
                        const newDate = new Date(startDateTime);
                        newDate.setMonth(month);
                        setStartDateTime(newDate);
                        setStartTime(newDate.toISOString());
                      } else {
                        const newDate = new Date(endDateTime);
                        newDate.setMonth(month);
                        setEndDateTime(newDate);
                        setEndTime(newDate.toISOString());
                      }
                    }}
                  />
                </AppView>
                <AppView style={{ flex: 1 }}>
                  <TextInput
                    mode="outlined"
                    label="Day"
                    keyboardType="numeric"
                    value={(isEditingStart ? startDateTime.getDate() : endDateTime.getDate()).toString()}
                    onChangeText={(text) => {
                      const day = parseInt(text) || 1;
                      if (isEditingStart) {
                        const newDate = new Date(startDateTime);
                        newDate.setDate(day);
                        setStartDateTime(newDate);
                        setStartTime(newDate.toISOString());
                      } else {
                        const newDate = new Date(endDateTime);
                        newDate.setDate(day);
                        setEndDateTime(newDate);
                        setEndTime(newDate.toISOString());
                      }
                    }}
                  />
                </AppView>
              </AppView>
            </AppView>
          )}
          
          {showTimePicker && (
            <AppView style={{ gap: spacing.md }}>
              <SegmentedButtons
                value={isEditingStart ? 'start' : 'end'}
                onValueChange={(value) => setIsEditingStart(value === 'start')}
                buttons={[
                  { value: 'start', label: 'Start Time' },
                  { value: 'end', label: 'End Time' }
                ]}
              />
              
              <AppView style={{ flexDirection: 'row', gap: spacing.sm }}>
                <AppView style={{ flex: 1 }}>
                  <TextInput
                    mode="outlined"
                    label="Hour"
                    keyboardType="numeric"
                    value={(isEditingStart ? startDateTime.getHours() : endDateTime.getHours()).toString()}
                    onChangeText={(text) => {
                      const hour = parseInt(text) || 0;
                      if (isEditingStart) {
                        const newDate = new Date(startDateTime);
                        newDate.setHours(hour);
                        setStartDateTime(newDate);
                        setStartTime(newDate.toISOString());
                      } else {
                        const newDate = new Date(endDateTime);
                        newDate.setHours(hour);
                        setEndDateTime(newDate);
                        setEndTime(newDate.toISOString());
                      }
                    }}
                  />
                </AppView>
                <AppView style={{ flex: 1 }}>
                  <TextInput
                    mode="outlined"
                    label="Minute"
                    keyboardType="numeric"
                    value={(isEditingStart ? startDateTime.getMinutes() : endDateTime.getMinutes()).toString()}
                    onChangeText={(text) => {
                      const minute = parseInt(text) || 0;
                      if (isEditingStart) {
                        const newDate = new Date(startDateTime);
                        newDate.setMinutes(minute);
                        setStartDateTime(newDate);
                        setStartTime(newDate.toISOString());
                      } else {
                        const newDate = new Date(endDateTime);
                        newDate.setMinutes(minute);
                        setEndDateTime(newDate);
                        setEndTime(newDate.toISOString());
                      }
                    }}
                  />
                </AppView>
              </AppView>
            </AppView>
          )}
          
          <AppView style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
            <Button
              mode="outlined"
              textColor="#000000"
              onPress={() => {
                setShowDatePicker(false);
                setShowTimePicker(false);
              }}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              textColor="#ffffff"
              onPress={() => {
                setShowDatePicker(false);
                setShowTimePicker(false);
              }}
              style={{ flex: 1 }}
            >
              Done
            </Button>
          </AppView>
        </View>
      </View>
    </Modal>
  </>
  );
}

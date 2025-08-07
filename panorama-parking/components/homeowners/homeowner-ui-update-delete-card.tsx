"use client";

import * as anchor from '@coral-xyz/anchor';

import { /* Keypair, */ PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
// import { ellipsify } from '@/lib/utils'
import { ellipsify } from '@/utils/ellipsify';
// import { ExplorerLink } from "../cluster/cluster-ui";
import {

  //useMarketplaceProgram,
  useMarketplaceProgramAccount
} from "./homeowner-data-access";
// import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletUi } from '@/components/solana/use-wallet-ui';

import { useEffect, useState } from "react";
import { ScrollView, RefreshControl, Modal, View } from 'react-native';
import { Button, TextInput, Card, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import dayjs from 'dayjs';
import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/components/app-theme';
import { YellowDebugPanel } from './debug-utils';


//Manage Listing
//shows current listing and update/delete button
export function ListingCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateListing, deleteListing } = useMarketplaceProgramAccount({
    account,
  });
  const { account: walletAccount } = useWalletUi();
  const publicKey = walletAccount?.publicKey;
  const { spacing } = useAppTheme();
  const [message, setMessage] = useState("");

  // State variables for listing fields
  const [address, setAddress] = useState("");
  //use current value
  //const [address, setAddress] = useState(accountQuery.data?.address  );

  const [rentalRate, setRentalRate] = useState(0);
  const [sensorId, setSensorId] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [availabilityStart, setAvailabilityStart] = useState('');
  const [availabilityEnd, setAvailabilityEnd] = useState('');
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Custom date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isEditingStart, setIsEditingStart] = useState(true);
  
  // Date objects for the pickers
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000));

  // Update state when accountQuery.data changes
  useEffect(() => {
    if (accountQuery.data) {
      setAddress(accountQuery.data.address);
      setRentalRate(accountQuery.data.rentalRate / LAMPORTS_PER_SOL);
      setSensorId(accountQuery.data.sensorId);
      setLatitude(accountQuery.data.latitude);
      setLongitude(accountQuery.data.longitude);
      setAdditionalInfo(accountQuery.data.additionalInfo || "");
      
      // Set date objects for pickers
      const startDate = dayjs.unix(Number(accountQuery.data.availabiltyStart)).toDate();
      const endDate = dayjs.unix(Number(accountQuery.data.availabiltyEnd)).toDate();
      setStartDateTime(startDate);
      setEndDateTime(endDate);
      
      setAvailabilityStart(dayjs.unix(Number(accountQuery.data.availabiltyStart)).format('YYYY-MM-DDTHH:mm'));
      setAvailabilityEnd(dayjs.unix(Number(accountQuery.data.availabiltyEnd)).format('YYYY-MM-DDTHH:mm'));
      setEmail(accountQuery.data.email);
      setPhone(accountQuery.data.phone);
    }
  }, [accountQuery.data]);

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

  // Load data from accountQuery
  const title = accountQuery.data?.address;

  // Form validation
  const isFormValid = message.trim() !== "";

  const handleSubmit = () => {
    if (publicKey) {
      updateListing.mutateAsync({
        address,
        rentalRate,
        sensorId,
        latitude,
        longitude,
        additionalInfo,
        availabiltyStart: new anchor.BN(Math.floor(new Date(availabilityStart).getTime() / 1000)),
        availabiltyEnd: new anchor.BN(Math.floor(new Date(availabilityEnd).getTime() / 1000)),
        email,
        phone,
        homeowner1: publicKey
      });
    }
  };

  if (!publicKey) {
    return (
      <AppView style={{ alignItems: 'center', gap: spacing.md }}>
        <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>Connect your wallet</AppText>
      </AppView>
    );
  }

  // Before rendering the card content, check if accountQuery is loading or has no data
  if (accountQuery.isLoading) {
    return (
      <AppView style={{ alignItems: 'center', gap: spacing.md }}>
        <ActivityIndicator size="large" />
        <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>Loading card...</AppText>
      </AppView>
    );
  }
  
  if (!accountQuery.data) {
    return (
      <AppView style={{ alignItems: 'center', gap: spacing.md }}>
        <AppText variant="bodyMedium" style={{ opacity: 0.7, textAlign: 'center' }}>
          Unable to load card data. Please try refreshing the page.
        </AppText>
      </AppView>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => accountQuery.refetch()} />}
    >
      <Card>
        <Card.Content>
          <AppView style={{ alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
            <AppText variant="titleLarge">Manage Listing</AppText>
            <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>(Update or Delete)</AppText>
            
            <AppView style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
              <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={updateListing.isPending}
                loading={updateListing.isPending}
                style={{ minWidth: 120 }}
              >
                Update
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => {
                  // console.log('=== DELETE BUTTON DEBUG ===');
                  // console.log('Delete button pressed');
                  // console.log('publicKey:', publicKey?.toString());
                  // console.log('accountQuery.data:', accountQuery.data);
                  // console.log('deleteListing.isPending:', deleteListing.isPending);
                  // console.log('deleteListing.error:', deleteListing.error);
                  
                  // Alert.alert implementation would go here
                  const title = accountQuery.data?.address;
                  // console.log('Title for deletion:', title);
                  
                  if (title) {
                    // console.log('Calling deleteListing.mutateAsync...');
                    return deleteListing.mutateAsync({ homeowner1: publicKey }).then((result: string) => {
                      // console.log('Delete mutation success:', result);
                    }).catch((error: Error) => {
                      // console.error('Delete mutation error:', error);
                    });
                  } else {
                    // console.log('No title found, not calling delete');
                  }
                }}
                disabled={deleteListing.isPending}
                loading={deleteListing.isPending}
                buttonColor="#d32f2f"
                textColor="#ffffff"
                style={{ minWidth: 120 }}
              >
                Delete
              </Button>
            </AppView>
          </AppView>

          {/* Debug panel for delete button */}
          {/* <YellowDebugPanel 
            publicKey={publicKey}
            accountQuery={accountQuery}
            deleteListing={deleteListing}
          /> */}

          <AppView style={{ gap: spacing.md }}>
            <AppView>
              <AppText variant="titleMedium">
                Home Address: <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>{accountQuery.data?.address}</AppText>
              </AppText>
              <TextInput
                mode="outlined"
              value={address}
                onChangeText={setAddress}
              placeholder="Home Address"
                style={{ marginTop: spacing.xs }}
              />
            </AppView>

            <AppView>
              <AppText variant="titleMedium">
                Rental Rate: <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>{accountQuery.data?.rentalRate}</AppText>
              </AppText>
              <TextInput
                mode="outlined"
                keyboardType="numeric"
                value={rentalRate ? rentalRate.toString() : ''}
                onChangeText={(text) => setRentalRate(Number(text) || 0)}
              placeholder="Rental Rate"
                style={{ marginTop: spacing.xs }}
              />
            </AppView>

            <AppView>
              <AppText variant="titleMedium">
                Sensor ID: <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>{accountQuery.data?.sensorId}</AppText>
              </AppText>
              <TextInput
                mode="outlined"
              value={sensorId}
                onChangeText={setSensorId}
              placeholder="Sensor ID"
                style={{ marginTop: spacing.xs }}
              />
            </AppView>

            <AppView>
              <AppText variant="titleMedium">
                Latitude: <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>{accountQuery.data?.latitude}</AppText>
              </AppText>
              <TextInput
                mode="outlined"
                keyboardType="numeric"
                value={latitude ? latitude.toString() : ''}
                onChangeText={(text) => setLatitude(Number(text) || 0)}
              placeholder="Latitude"
                style={{ marginTop: spacing.xs }}
              />
            </AppView>

            <AppView>
              <AppText variant="titleMedium">
                Longitude: <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>{accountQuery.data?.longitude}</AppText>
              </AppText>
              <TextInput
                mode="outlined"
                keyboardType="numeric"
                value={longitude ? longitude.toString() : ''}
                onChangeText={(text) => setLongitude(Number(text) || 0)}
              placeholder="Longitude"
                style={{ marginTop: spacing.xs }}
              />
            </AppView>

            <AppView>
              <AppText variant="titleMedium">
                Additional Info: <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>{accountQuery.data?.additionalInfo}</AppText>
              </AppText>
              <TextInput
                mode="outlined"
              value={additionalInfo}
                onChangeText={setAdditionalInfo}
                multiline
                numberOfLines={3}
              placeholder="Additional Info"
                style={{ marginTop: spacing.xs }}
            />
            </AppView>

            {/* Availability Start/End */}
            <AppView>
              <AppView style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <AppText variant="titleMedium">Availability Start</AppText>
                <Button 
                  mode="text" 
                  compact
                  onPress={() => {
                    const now = new Date();
                    setStartDateTime(now);
                    setAvailabilityStart(now.toISOString());
                  }}
                >
                  Quick Select
                </Button>
              </AppView>
              <AppView style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
                <AppView style={{ flex: 1 }}>
                  <Button
                    mode="outlined"
                    onPress={() => openDatePicker(true)}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    {formatDate(startDateTime)}
                  </Button>
                </AppView>
                <AppView style={{ flex: 1 }}>
                  <Button
                    mode="outlined"
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
            </AppView>

            <AppView>
              <AppView style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <AppText variant="titleMedium">Availability End</AppText>
                <Button 
                  mode="text" 
                  compact
                  onPress={() => {
                    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
                    setEndDateTime(endTime);
                    setAvailabilityEnd(endTime.toISOString());
                  }}
                >
                  Quick Select
                </Button>
              </AppView>
              <AppView style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
                <AppView style={{ flex: 1 }}>
                  <Button
                    mode="outlined"
                    onPress={() => openDatePicker(false)}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    {formatDate(endDateTime)}
                  </Button>
                </AppView>
                <AppView style={{ flex: 1 }}>
                  <Button
                    mode="outlined"
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
            </AppView>

            <AppView>
              <AppText variant="titleMedium">
                Email: <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>{accountQuery.data?.email}</AppText>
              </AppText>
              <TextInput
                mode="outlined"
                keyboardType="email-address"
              value={email}
                onChangeText={setEmail}
              placeholder="Email"
                style={{ marginTop: spacing.xs }}
              />
            </AppView>

            <AppView>
              <AppText variant="titleMedium">
                Phone: <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>{accountQuery.data?.phone}</AppText>
              </AppText>
              <TextInput
                mode="outlined"
                keyboardType="phone-pad"
              value={phone}
                onChangeText={setPhone}
              placeholder="Phone"
                style={{ marginTop: spacing.xs }}
            />
            </AppView>
          </AppView>

          <AppView style={{ marginTop: spacing.lg, alignItems: 'center', gap: spacing.md }}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={updateListing.isPending}
              loading={updateListing.isPending}
              style={{ minWidth: 200 }}
            >
              Update Listing
            </Button>

            <Button
              mode="outlined"
              onPress={() => {
                // Alert.alert implementation would go here
                const title = accountQuery.data?.address;
                if (title) {
                  return deleteListing.mutateAsync({ homeowner1: publicKey });
                }
              }}
              disabled={deleteListing.isPending}
              loading={deleteListing.isPending}
              buttonColor="#d32f2f"
              textColor="#ffffff"
              style={{ minWidth: 200 }}
            >
              Delete Listing
            </Button>
          </AppView>
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
                          setAvailabilityStart(newDate.toISOString());
                        } else {
                          const newDate = new Date(endDateTime);
                          newDate.setFullYear(year);
                          setEndDateTime(newDate);
                          setAvailabilityEnd(newDate.toISOString());
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
                          setAvailabilityStart(newDate.toISOString());
                        } else {
                          const newDate = new Date(endDateTime);
                          newDate.setMonth(month);
                          setEndDateTime(newDate);
                          setAvailabilityEnd(newDate.toISOString());
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
                          setAvailabilityStart(newDate.toISOString());
                        } else {
                          const newDate = new Date(endDateTime);
                          newDate.setDate(day);
                          setEndDateTime(newDate);
                          setAvailabilityEnd(newDate.toISOString());
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
                          setAvailabilityStart(newDate.toISOString());
                        } else {
                          const newDate = new Date(endDateTime);
                          newDate.setHours(hour);
                          setEndDateTime(newDate);
                          setAvailabilityEnd(newDate.toISOString());
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
                          setAvailabilityStart(newDate.toISOString());
                        } else {
                          const newDate = new Date(endDateTime);
                          newDate.setMinutes(minute);
                          setEndDateTime(newDate);
                          setAvailabilityEnd(newDate.toISOString());
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
    </ScrollView>
  );
}


"use client";

import * as anchor from '@coral-xyz/anchor';

import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
// import { ellipsify } from '@/lib/utils';
import { ellipsify } from '@/utils/ellipsify';
// import { ExplorerLink } from "../cluster/cluster-ui";
import {

  useMarketplaceProgram,
  useMarketplaceProgramAccount
} from "./homeowner-data-access";
// import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletUi } from '@/components/solana/use-wallet-ui';

import { useEffect, useState } from "react";
import { ScrollView, RefreshControl, Platform, Alert, Modal, View } from 'react-native';
import { Button, TextInput, Card, Chip, SegmentedButtons } from 'react-native-paper';

import {ListingCard} from "./homeowner-ui-update-delete-card";
import dayjs from 'dayjs';
import { toUnixTime, solToLamports, isFormValid } from './homeowner-ui-helpers';
import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/components/app-theme';

export function ListingCreate() {
  const { createListing } = useMarketplaceProgram();
  const { account } = useWalletUi();
  const publicKey = account?.publicKey;
  const { spacing } = useAppTheme();

  const [address, setAddress] = useState("");              // Address (String)
  const [rentalRate, setRentalRate] = useState('');        // Rental rate (string, input)
  const [sensorId, setSensorId] = useState("");            // Sensor ID (String)
  const [latitude, setLatitude] = useState(0);             // Latitude (f64)
  const [longitude, setLongitude] = useState(0);           // Longitude (f64)
  const [additionalInfo, setAdditionalInfo] = useState(""); // Additional information (Option<String>)
  const [availabilityStart, setAvailabilityStart] = useState(""); // Availability start (string)
  const [availabilityEnd, setAvailabilityEnd] = useState("");     // Availability end (string)
  const [email, setEmail] = useState("");                  // Email (String)
  const [phone, setPhone] = useState("");

  // Custom date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isEditingStart, setIsEditingStart] = useState(true);
  
  // Date objects for the pickers
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000)); // 2 hours from now

  // Helper functions for date picker
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Update the main availability fields when date/time changes
  useEffect(() => {
    setAvailabilityStart(startDateTime.toISOString());
  }, [startDateTime]);

  useEffect(() => {
    setAvailabilityEnd(endDateTime.toISOString());
  }, [endDateTime]);

  // Custom date picker functions
  const openDatePicker = (isStart: boolean) => {
    setIsEditingStart(isStart);
    setShowDatePicker(true);
  };

  const openTimePicker = (isStart: boolean) => {
    setIsEditingStart(isStart);
    setShowTimePicker(true);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const getTomorrowDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  const getNextWeekDateTime = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().slice(0, 16);
  };

  const showDatePresets = (isStart: boolean) => {
    Alert.alert(
      'Quick Date Selection',
      'Choose a preset:',
      [
        {
          text: 'Now',
          onPress: () => {
            const now = new Date();
            if (isStart) {
              setStartDateTime(now);
            } else {
              setEndDateTime(now);
            }
          }
        },
        {
          text: 'Tomorrow',
          onPress: () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0); // 9 AM
            
            if (isStart) {
              setStartDateTime(tomorrow);
            } else {
              const endTime = new Date(tomorrow);
              endTime.setHours(17, 0, 0, 0); // 5 PM
              setEndDateTime(endTime);
            }
          }
        },
        {
          text: 'Next Week',
          onPress: () => {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            nextWeek.setHours(9, 0, 0, 0); // 9 AM
            
            if (isStart) {
              setStartDateTime(nextWeek);
            } else {
              const endTime = new Date(nextWeek);
              endTime.setHours(17, 0, 0, 0); // 5 PM
              setEndDateTime(endTime);
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const formValid = isFormValid({
    address,
    rentalRate: rentalRate === '' ? 0 : Number(rentalRate),
    sensorId,
    latitude: latitude,
    longitude: longitude,
    additionalInfo,
    availabilityStart: String(availabilityStart),
    availabilityEnd: String(availabilityEnd),
    email,
    phone,
  });

  // Debug validation
  const validationErrors = [];
  if (address.trim() === "") validationErrors.push("Address is required");
  if (solToLamports(rentalRate === '' ? 0 : Number(rentalRate)) <= 1) validationErrors.push("Rental rate must be greater than 0");
  if (sensorId.trim() === "") validationErrors.push("Sensor ID is required");
  if (Number(latitude) === 0) validationErrors.push("Latitude is required");
  if (Number(longitude) === 0) validationErrors.push("Longitude is required");
  if (availabilityStart === "") validationErrors.push("Availability start is required");
  if (availabilityEnd === "") validationErrors.push("Availability end is required");
  if (email.trim() === "") validationErrors.push("Email is required");
  if (phone.trim() === "") validationErrors.push("Phone is required");

  const handleSubmit = async () => {
    console.log('Create listing button pressed');
    
    if (publicKey && formValid) {
      console.log('Attempting to create listing...');
      try {
        await createListing.mutateAsync({
          address,
          rentalRate: solToLamports(rentalRate === '' ? 0 : Number(rentalRate)),
          sensorId,
          latitude,
          longitude,
          additionalInfo,
          availabilityStart: toUnixTime(availabilityStart),
          availabilityEnd: toUnixTime(availabilityEnd),
          email,
          phone,
          homeowner1: publicKey
        });
        console.log('Listing creation initiated!');
      } catch (error) {
        console.error('Error creating listing:', error);
      }
    } else {
      console.log('Cannot create listing - missing publicKey or form invalid');
    }
  };

  if (!publicKey) {
    return (
      <AppView style={{ alignItems: 'center', gap: spacing.md }}>
        <AppText variant="titleMedium">Connect your wallet</AppText>
      </AppView>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}
    >
      <AppView style={{ alignItems: 'center', gap: spacing.sm }}>
        <AppText variant="titleLarge">Create a New Listing</AppText>
      </AppView>

      <Card style={{ marginTop: spacing.md }}>
        <Card.Content>
          <AppView style={{ gap: spacing.md }}>
            <AppView>
              <AppText variant="titleMedium">Home Address to Rent Out</AppText>
              <TextInput
                mode="outlined"
                placeholder="Enter the address of your property"
                value={address}
                onChangeText={setAddress}
                style={{ marginTop: spacing.xs }}
              />
            </AppView>

            <AppView>
              <AppText variant="titleMedium">Rental Rate per Hour</AppText>
              <AppText variant="bodySmall" style={{ opacity: 0.7 }}>
                https://www.coinbase.com/converter/sol/usd
              </AppText>
              <AppView style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                <AppText variant="bodyMedium">SOL</AppText>
                <TextInput
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="e.g., 0.0345"
                  value={rentalRate}
                  onChangeText={setRentalRate}
                  style={{ flex: 1 }}
                />
                <AppText variant="bodyMedium">USD</AppText>
                <AppText variant="titleMedium">${(rentalRate === '' ? '0.00' : (Number(rentalRate) * 200).toFixed(2))}</AppText>
              </AppView>
            </AppView>

            <AppView>
              <AppView style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <AppText variant="titleMedium">Sensor ID</AppText>
                <Chip 
                  mode="outlined" 
                  onPress={() => setSensorId('70B3D57ED0001A2B')}
                  compact
                >
                  Generate ID (for testing)
                </Chip>
              </AppView>
              <TextInput
                mode="outlined"
                placeholder="Enter your sensor ID"
                value={sensorId}
                onChangeText={setSensorId}
                style={{ marginTop: spacing.xs }}
              />
            </AppView>

            <AppView>
              <AppView style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <AppText variant="titleMedium">Latitude</AppText>
                <Button 
                  mode="text" 
                  compact
                  onPress={() => {}}
                >
                  Get Coordinates
                </Button>
              </AppView>
              <TextInput
                mode="outlined"
                keyboardType="numeric"
                placeholder="e.g., 37.7749"
                value={latitude ? latitude.toString() : ''}
                onChangeText={(text) => setLatitude(Number(text) || 0)}
                style={{ marginTop: spacing.xs }}
              />
            </AppView>

            <AppView>
              <AppText variant="titleMedium">Longitude</AppText>
              <TextInput
                mode="outlined"
                keyboardType="numeric"
                placeholder="e.g., -122.4194"
                value={longitude ? longitude.toString() : ''}
                onChangeText={(text) => setLongitude(Number(text) || 0)}
                style={{ marginTop: spacing.xs }}
              />
            </AppView>

            <AppView>
              <AppText variant="titleMedium">Additional Information</AppText>
              <TextInput
                mode="outlined"
                placeholder="e.g., Covered parking, near entrance, etc."
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                multiline
                numberOfLines={3}
                style={{ marginTop: spacing.xs }}
              />
            </AppView>

            <AppView>
              <AppView style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <AppText variant="titleMedium">Availability Start</AppText>
                <Button 
                  mode="text" 
                  compact
                  onPress={() => showDatePresets(true)}
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
                  onPress={() => showDatePresets(false)}
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
              <AppText variant="titleMedium">Email</AppText>
              <TextInput
                mode="outlined"
                keyboardType="email-address"
                placeholder="your.email@example.com"
                value={email}
                onChangeText={setEmail}
                style={{ marginTop: spacing.xs }}
              />
            </AppView>

            <AppView>
              <AppText variant="titleMedium">Phone</AppText>
              <TextInput
                mode="outlined"
                keyboardType="phone-pad"
                placeholder="(123) 456-7890"
                value={phone}
                onChangeText={setPhone}
                style={{ marginTop: spacing.xs }}
              />
            </AppView>
          </AppView>
        </Card.Content>
      </Card>

      {/* Debug validation errors */}
      {validationErrors.length > 0 && (
        <AppView style={{ marginTop: spacing.md, padding: spacing.sm, backgroundColor: '#fff3cd', borderRadius: 8 }}>
          <AppText variant="bodySmall" style={{ color: '#856404', fontWeight: 'bold' }}>
            Please fill in the following required fields:
          </AppText>
          {validationErrors.map((error, index) => (
            <AppText key={index} variant="bodySmall" style={{ color: '#856404', marginLeft: spacing.sm }}>
              • {error}
            </AppText>
          ))}
        </AppView>
      )}

      <AppView style={{ marginTop: spacing.lg, alignItems: 'center', backgroundColor: '#e3f2fd', padding: spacing.md, borderRadius: 8 }}>
        <AppText variant="titleMedium" style={{ marginBottom: spacing.sm, color: '#1976d2' }}>
          Submit Your Listing
        </AppText>
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={createListing.isPending || !formValid}
          loading={createListing.isPending}
          style={{ minWidth: 200, backgroundColor: formValid ? '#1976d2' : '#ccc' }}
        >
          Create A Listing
        </Button>
        {!formValid && (
          <AppText variant="bodySmall" style={{ marginTop: spacing.xs, opacity: 0.7 }}>
            Please fill in all required fields
          </AppText>
        )}
        <AppText variant="bodySmall" style={{ marginTop: spacing.xs, opacity: 0.5 }}>
          Form valid: {formValid ? 'Yes' : 'No'}
        </AppText>
      </AppView>

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
                        } else {
                          const newDate = new Date(endDateTime);
                          newDate.setFullYear(year);
                          setEndDateTime(newDate);
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
                        } else {
                          const newDate = new Date(endDateTime);
                          newDate.setMonth(month);
                          setEndDateTime(newDate);
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
                        } else {
                          const newDate = new Date(endDateTime);
                          newDate.setDate(day);
                          setEndDateTime(newDate);
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
                        } else {
                          const newDate = new Date(endDateTime);
                          newDate.setHours(hour);
                          setEndDateTime(newDate);
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
                        } else {
                          const newDate = new Date(endDateTime);
                          newDate.setMinutes(minute);
                          setEndDateTime(newDate);
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


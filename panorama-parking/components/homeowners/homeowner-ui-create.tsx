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
import { ScrollView, RefreshControl } from 'react-native';
import { Button, TextInput, Card, Chip } from 'react-native-paper';

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
              <AppText variant="titleMedium">Availability Start</AppText>
              <TextInput
                mode="outlined"
                placeholder="YYYY-MM-DD HH:MM"
                value={availabilityStart}
                onChangeText={setAvailabilityStart}
                style={{ marginTop: spacing.xs }}
              />
            </AppView>

            <AppView>
              <AppText variant="titleMedium">Availability End</AppText>
              <TextInput
                mode="outlined"
                placeholder="YYYY-MM-DD HH:MM"
                value={availabilityEnd}
                onChangeText={setAvailabilityEnd}
                style={{ marginTop: spacing.xs }}
              />
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
    </ScrollView>
  );
}


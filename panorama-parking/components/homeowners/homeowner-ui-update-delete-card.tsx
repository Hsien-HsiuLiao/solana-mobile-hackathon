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
import { ScrollView, RefreshControl } from 'react-native';
import { Button, TextInput, Card, ActivityIndicator } from 'react-native-paper';
import dayjs from 'dayjs';
import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/components/app-theme';


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

  // Update state when accountQuery.data changes
  useEffect(() => {
    if (accountQuery.data) {
      setAddress(accountQuery.data.address);
      setRentalRate(accountQuery.data.rentalRate / LAMPORTS_PER_SOL);
      setSensorId(accountQuery.data.sensorId);
      setLatitude(accountQuery.data.latitude);
      setLongitude(accountQuery.data.longitude);
      setAdditionalInfo(accountQuery.data.additionalInfo || "");
      setAvailabilityStart(dayjs.unix(Number(accountQuery.data.availabiltyStart)).format('YYYY-MM-DDTHH:mm'));
      setAvailabilityEnd(dayjs.unix(Number(accountQuery.data.availabiltyEnd)).format('YYYY-MM-DDTHH:mm'));
      setEmail(accountQuery.data.email);
      setPhone(accountQuery.data.phone);
    }
  }, [accountQuery.data]);

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
                    return deleteListing.mutateAsync({ homeowner1: publicKey }).then((result) => {
                      // console.log('Delete mutation success:', result);
                    }).catch((error) => {
                      // console.error('Delete mutation error:', error);
                    });
                  } else {
                    // console.log('No title found, not calling delete');
                  }
                }}
                disabled={deleteListing.isPending}
                loading={deleteListing.isPending}
                buttonColor="#d32f2f"
                textColor="#d32f2f"
                style={{ minWidth: 120 }}
              >
                Delete
              </Button>
            </AppView>
          </AppView>

          {/* Debug panel for delete button */}
          <AppView style={{ backgroundColor: '#fff3cd', padding: spacing.md, borderRadius: 8, marginTop: spacing.sm, borderWidth: 1, borderColor: '#ffc107' }}>
            <AppText variant="titleMedium" style={{ color: '#856404', fontWeight: 'bold', marginBottom: spacing.xs }}>
              🔧 Delete Debug Info
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
              Public Key: {publicKey?.toString().slice(0, 8)}...
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
              Has Data: {accountQuery.data ? '✅ Yes' : '❌ No'}
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
              Is Pending: {deleteListing.isPending ? '🔄 Yes' : '✅ No'}
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
              Error: {deleteListing.error?.message || 'None'}
            </AppText>
            <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
              Address: {accountQuery.data?.address || 'Not available'}
            </AppText>
          </AppView>

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
              <AppText variant="titleMedium">Availability Start</AppText>
              <TextInput
                mode="outlined"
                placeholder="Availability Start"
                value={availabilityStart}
                onChangeText={setAvailabilityStart}
                style={{ marginTop: spacing.xs }}
              />
              <AppText variant="titleMedium" style={{ marginTop: spacing.md }}>Availability End</AppText>
              <TextInput
                mode="outlined"
                placeholder="Availability End"
                value={availabilityEnd}
                onChangeText={setAvailabilityEnd}
                style={{ marginTop: spacing.xs }}
              />
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
              textColor="#d32f2f"
              style={{ minWidth: 200 }}
            >
              Delete Listing
            </Button>
          </AppView>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}


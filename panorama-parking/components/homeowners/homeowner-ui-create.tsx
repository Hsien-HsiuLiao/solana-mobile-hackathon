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
import { TextInput, Pressable, Linking } from 'react-native';

import {ListingCard} from "./homeowner-ui-update-delete-card";
import dayjs from 'dayjs';
import { toUnixTime, solToLamports, isFormValid } from './homeowner-ui-helpers';
import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';

export function ListingCreate() {
  const { createListing } = useMarketplaceProgram();
  const { account } = useWalletUi();
  const publicKey = account?.publicKey;

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

  const handleSubmit = async () => {
    if (publicKey && formValid) {
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
    }
  };

  if (!publicKey) {
    return <AppText>Connect your wallet</AppText>;
  }

  return (
    /* This is the create listing form. user can add picture either https://filecoin.io/ or https://arweave.org/ */
    <AppView>
      <AppText variant="titleLarge">Create a New Listing</AppText>

      <AppView>
        <AppText>
          Home Address to Rent Out
          <AppText>?</AppText>
        </AppText>
        <TextInput
          placeholder="Enter the address of your property"
          value={address}
          onChangeText={setAddress}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </AppView>

      <AppView>
        <AppText>
          Rental Rate per Hour
          <AppText>?</AppText> https://www.coinbase.com/converter/sol/usd
        </AppText>
        <AppView>
          <AppText>SOL</AppText>
          <TextInput
            keyboardType="numeric"
            placeholder="e.g., 0.0345"
            value={rentalRate}
            onChangeText={setRentalRate}
            className="input input-bordered w-1/4 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black text-left"
          />
          <AppText>USD</AppText>
          <AppText>${(rentalRate === '' ? '0.00' : (Number(rentalRate) * 200).toFixed(2))}</AppText>
        </AppView>
      </AppView>

      <AppView>
        <AppView>
          <AppText>Sensor ID</AppText>
          <AppText>?</AppText>
          <Pressable
            className="ml-2 px-4 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-300 hover:bg-blue-200 text-xs"
            onPress={() => setSensorId('70B3D57ED0001A2B')}
          >
            <AppText>Generate ID (for testing only)</AppText>
          </Pressable>
        </AppView>
        <TextInput
          placeholder="Enter your sensor ID"
          value={sensorId}
          onChangeText={setSensorId}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </AppView>

      <AppView>
        <AppView>
          <AppText>Latitude</AppText>
          <AppText>?</AppText>
          <Pressable onPress={() => Linking.openURL('https://www.gps-coordinates.net/')}>
            <AppText>Get Coordinates</AppText>
          </Pressable>
        </AppView>
        <TextInput
          keyboardType="numeric"
          placeholder="e.g., 37.7749"
          value={latitude ? latitude.toString() : ''}
          onChangeText={(text) => setLatitude(Number(text) || 0)}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </AppView>

      <AppView>
        <AppView>
          <AppText>Longitude</AppText>
          <AppText>?</AppText>
        </AppView>
        <TextInput
          keyboardType="numeric"
          placeholder="e.g., -122.4194"
          value={longitude ? longitude.toString() : ''}
          onChangeText={(text) => setLongitude(Number(text) || 0)}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </AppView>

      <AppView>
        <AppText>
          Additional Information
          <AppText>?</AppText>
        </AppText>
        <TextInput
          placeholder="e.g., Covered parking, near entrance, etc."
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          multiline
          numberOfLines={3}
          className="textarea textarea-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </AppView>

      <AppView>
        <AppText>
          Availability Start
          <AppText>?</AppText>
        </AppText>
        <TextInput
          placeholder="YYYY-MM-DD HH:MM"
          value={availabilityStart}
          onChangeText={setAvailabilityStart}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </AppView>

      <AppView>
        <AppText>
          Availability End
          <AppText>?</AppText>
        </AppText>
        <TextInput
          placeholder="YYYY-MM-DD HH:MM"
          value={availabilityEnd}
          onChangeText={setAvailabilityEnd}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </AppView>

      <AppView>
        <AppText>
          Email
          <AppText>?</AppText>
        </AppText>
        <TextInput
          keyboardType="email-address"
          placeholder="your.email@example.com"
          value={email}
          onChangeText={setEmail}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </AppView>

      <AppView>
        <AppText>
          Phone
          <AppText>?</AppText>
        </AppText>
        <TextInput
          keyboardType="phone-pad"
          placeholder="(123) 456-7890"
          value={phone}
          onChangeText={setPhone}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </AppView>

      <Pressable
        className="bg-blue-500 text-white border-2 border-blue-700 hover:bg-blue-600 hover:border-blue-800 transition-all duration-300 ease-in-out px-6 py-3 rounded-lg shadow-lg w-full"
        onPress={handleSubmit}
        disabled={createListing.isPending || !formValid}
      >
        <AppText>Create A Listing {createListing.isPending && "..."}</AppText>
      </Pressable>

      /* End create listing form */

    </AppView>
  );
}


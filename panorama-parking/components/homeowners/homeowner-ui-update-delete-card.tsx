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
import { TextInput, Pressable, Alert } from 'react-native';
import dayjs from 'dayjs';
import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';


//Manage Listing
//shows current listing and update/delete button
export function ListingCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateListing, deleteListing } = useMarketplaceProgramAccount({
    account,
  });
  const { account: walletAccount } = useWalletUi();
  const publicKey = walletAccount?.publicKey;
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
    return <AppText>Connect your wallet</AppText>;
  }

  // Before rendering the card content, check if accountQuery is loading or has no data
  if (accountQuery.isLoading) {
    return <AppView><AppText>Loading card...</AppText></AppView>;
  }
  if (!accountQuery.data) {
    return <AppView><AppText>Unable to load card data. Please try refreshing the page.</AppText></AppView>;
  }

  return (
    <AppView>
      <AppView>
        <AppView>
          <Pressable onPress={() => accountQuery.refetch()}>
            <AppText>
              Manage Listing
              <AppText>(Update or Delete)</AppText> 
            </AppText>
          </Pressable>
          <AppView>
            <AppText>
              Home Address: <AppText>{accountQuery.data?.address}</AppText>
            </AppText>
            <TextInput
              value={address}
              onChangeText={setAddress}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Home Address"
            />

            <AppText>
              Rental Rate: <AppText>{accountQuery.data?.rentalRate}</AppText>
            </AppText>
            <TextInput
              keyboardType="numeric"
              value={rentalRate ? rentalRate.toString() : ''}
              onChangeText={(text) => setRentalRate(Number(text) || 0)}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Rental Rate"
            />

            <AppText>
              Sensor ID: <AppText>{accountQuery.data?.sensorId}</AppText>
            </AppText>
            <TextInput
              value={sensorId}
              onChangeText={setSensorId}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Sensor ID"
            />

            <AppText>
              Latitude: <AppText>{accountQuery.data?.latitude}</AppText>
            </AppText>
            <TextInput
              keyboardType="numeric"
              value={latitude ? latitude.toString() : ''}
              onChangeText={(text) => setLatitude(Number(text) || 0)}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Latitude"
            />

            <AppText>
              Longitude: <AppText>{accountQuery.data?.longitude}</AppText>
            </AppText>
            <TextInput
              keyboardType="numeric"
              value={longitude ? longitude.toString() : ''}
              onChangeText={(text) => setLongitude(Number(text) || 0)}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Longitude"
            />

            <AppText>
              Additional Info: <AppText>{accountQuery.data?.additionalInfo}</AppText>
            </AppText>
            <TextInput
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              multiline
              numberOfLines={3}
              className="textarea textarea-bordered w-full max-w-xs border border-black text-black"
              placeholder="Additional Info"
            />

            {/* Availability Start/End */}
            <AppView>
              <AppText>
                Availability Start
              </AppText>
              <TextInput
                placeholder="Availability Start"
                value={availabilityStart}
                onChangeText={setAvailabilityStart}
                className="input input-bordered w-full max-w-xs border border-black text-black mx-auto"
              />
              <AppText>
                Availability End
              </AppText>
              <TextInput
                placeholder="Availability End"
                value={availabilityEnd}
                onChangeText={setAvailabilityEnd}
                className="input input-bordered w-full max-w-xs border border-black text-black mx-auto"
              />
            </AppView>

            <AppText>
              Email: <AppText>{accountQuery.data?.email}</AppText>
            </AppText>
            <TextInput
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Email"
            />

            <AppText>
              Phone: <AppText>{accountQuery.data?.phone}</AppText>
            </AppText>
            <TextInput
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Phone"
            />
          </AppView>



          <AppView>

            <Pressable
              className="bg-blue-500 text-white border-2 border-blue-700 hover:bg-blue-600 hover:border-blue-800 transition-all duration-300 ease-in-out px-6 py-3 rounded-lg shadow-lg"
              onPress={handleSubmit}
              disabled={updateListing.isPending}
            >
              <AppText>Update Listing {updateListing.isPending && "..."}</AppText>
            </Pressable>
          </AppView>

          <AppView>
            {/*
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
            */}
            <Pressable
              className="bg-red-500 border border-red-700 rounded-md px-4 py-2 text-black hover:bg-red-600 transition"
              onPress={() => {
                Alert.alert(
                  "Confirm Delete",
                  "Are you sure you want to close this account?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel"
                    },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        const title = accountQuery.data?.address;
                        if (title) {
                          return deleteListing.mutateAsync({ homeowner1: publicKey });
                        }
                      }
                    }
                  ]
                );
              }}
              disabled={deleteListing.isPending}
            >
              <AppText>Delete Listing</AppText>
            </Pressable>
          </AppView>
        </AppView>
      </AppView>
    </AppView>
  );
}


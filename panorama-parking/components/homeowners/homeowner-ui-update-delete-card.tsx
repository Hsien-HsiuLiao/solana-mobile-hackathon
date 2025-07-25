"use client";

import * as anchor from '@coral-xyz/anchor';

import { /* Keypair, */ PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ellipsify } from '@/lib/utils'
import { ExplorerLink } from "../cluster/cluster-ui";
import {

  //useMarketplaceProgram,
  useMarketplaceProgramAccount
} from "./homeowner-data-access";
import { useWallet } from "@solana/wallet-adapter-react";

import { useEffect, useState } from "react";
import dayjs from 'dayjs';


//Manage Listing
//shows current listing and update/delete button
export function ListingCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateListing, deleteListing } = useMarketplaceProgramAccount({
    account,
  });
  const { publicKey } = useWallet();
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
        availabilityStart: new anchor.BN(Math.floor(new Date(availabilityStart).getTime() / 1000)),
        availabilityEnd: new anchor.BN(Math.floor(new Date(availabilityEnd).getTime() / 1000)),
        email,
        phone,
        homeowner1: publicKey
      });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  // Before rendering the card content, check if accountQuery is loading or has no data
  if (accountQuery.isLoading) {
    return <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg text-gray-700 text-center">Loading card...</div>;
  }
  if (!accountQuery.data) {
    return <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg text-gray-700 text-center">Unable to load card data. Please try refreshing the page.</div>;
  }

  return (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content bg-blue-500">
      <div className="card-body items-center text-center bg-blue-200">
        <div className="space-y-6">
          <h2 className="card-title justify-center text-3xl cursor-pointer text-black" onClick={() => accountQuery.refetch()}>
            Manage Listing
            <p className="text-base ">(Update or Delete)</p> 
            </h2>
          <div className="space-y-4">
            <label htmlFor="address" className="block text-sm font-medium text-black">
              Home Address: <span className="text-black-300">{/* {accountQuery.data?.address} */}</span>
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Home Address"
            />

            <label htmlFor="rentalRate" className="block text-sm font-medium text-black">
              Rental Rate: <span className="text-black-300">{/* {accountQuery.data?.rentalRate} */}</span>
            </label>
            <input
              type="number"
              id="rentalRate"
              value={rentalRate}
              onChange={(e) => setRentalRate(Number(e.target.value))}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Rental Rate"
            />

            <label htmlFor="sensorId" className="block text-sm font-medium text-black">
              Sensor ID: <span className="text-black-300">{/* {accountQuery.data?.sensorId} */}</span>
            </label>
            <input
              type="text"
              id="sensorId"
              value={sensorId}
              onChange={(e) => setSensorId(e.target.value)}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Sensor ID"
            />

            <label htmlFor="latitude" className="block text-sm font-medium text-black">
              Latitude: <span className="text-black-300">{/* {accountQuery.data?.latitude} */}</span>
            </label>
            <input
              type="number"
              id="latitude"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Latitude"
            />

            <label htmlFor="longitude" className="block text-sm font-medium text-black">
              Longitude: <span className="text-black-300">{/* {accountQuery.data?.longitude} */}</span>
            </label>
            <input
              type="number"
              id="longitude"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Longitude"
            />

            <label htmlFor="additionalInfo" className="block text-sm font-medium text-black">
              Additional Info: <span className="text-black-300">{/* {accountQuery.data?.additionalInfo} */}</span>
            </label>
            <textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="textarea textarea-bordered w-full max-w-xs border border-black text-black"
              placeholder="Additional Info"
            />

            {/* Availability Start/End */}
            <div className="mb-4 flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center w-full max-w-xs">
                Availability Start
              </label>
              <input
                type="datetime-local"
                id="availabilityStart"
                placeholder="Availability Start"
                value={availabilityStart}
                onChange={e => setAvailabilityStart(e.target.value)}
                className="input input-bordered w-full max-w-xs border border-black text-black mx-auto"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center w-full max-w-xs mt-2">
                Availability End
              </label>
              <input
                type="datetime-local"
                id="availabilityEnd"
                placeholder="Availability End"
                value={availabilityEnd}
                onChange={e => setAvailabilityEnd(e.target.value)}
                className="input input-bordered w-full max-w-xs border border-black text-black mx-auto"
              />
            </div>

            <label htmlFor="email" className="block text-sm font-medium text-black">
              Email: <span className="text-black-300">{/* {accountQuery.data?.email} */}</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Email"
            />

            <label htmlFor="phone" className="block text-sm font-medium text-black">
              Phone: <span className="text-black-300">{/* {accountQuery.data?.phone} */}</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input input-bordered w-full max-w-xs border border-black text-black"
              placeholder="Phone"
            />
          </div>



          <div className="card-actions justify-around">

            <button
              className="bg-blue-500 text-white border-2 border-blue-700 hover:bg-blue-600 hover:border-blue-800 transition-all duration-300 ease-in-out px-6 py-3 rounded-lg shadow-lg"
              onClick={handleSubmit}
              disabled={updateListing.isPending}
            >
              Update Listing {updateListing.isPending && "..."}
            </button>
          </div>

          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
            <button
              className="bg-red-500 border border-red-700 rounded-md px-4 py-2 text-black hover:bg-red-600 transition"
              onClick={() => {
                if (
                  !window.confirm(
                    "Are you sure you want to close this account?"
                  )
                ) {
                  return;
                }
                const title = accountQuery.data?.address;
                if (title) {
                  return deleteListing.mutateAsync({ homeowner1: publicKey });
                }
              }}
              disabled={deleteListing.isPending}
            >
              Delete Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


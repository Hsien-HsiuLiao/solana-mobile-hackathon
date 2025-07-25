"use client";

import * as anchor from '@coral-xyz/anchor';

import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
// import { useMemo } from 'react';
import { ellipsify } from '@/lib/utils'
import { ExplorerLink } from "../cluster/cluster-ui";
import {

  useMarketplaceProgram,
  useMarketplaceProgramAccount
} from "./homeowner-data-access";
import { useWallet } from "@solana/wallet-adapter-react";

import { useEffect, useState } from "react";

import {ListingCard} from "./homeowner-ui-update-delete-card";
import dayjs from 'dayjs';
import { toUnixTime, solToLamports, isFormValid } from './homeowner-ui-helpers';

export function ListingCreate() {
  const { createListing } = useMarketplaceProgram();
  const { publicKey } = useWallet();

  const [address, setAddress] = useState("");              // Address (String)
  const [rentalRate, setRentalRate] = useState('');        // Rental rate (string, input)
  const [sensorId, setSensorId] = useState("");            // Sensor ID (String)
  const [latitude, setLatitude] = useState(0);             // Latitude (f64)
  const [longitude, setLongitude] = useState(0);           // Longitude (f64)
  const [additionalInfo, setAdditionalInfo] = useState(""); // Additional information (Option<String>)
  const [availabilityStart, setAvailabilityStart] = useState(""); // Availability start (string)
  const [availabilityEnd, setAvailabilityEnd] = useState("");     // Availability end (string)
  const [email, setEmail] = useState("");                  // Email (String)
  const [phone, setPhone] = useState("");                  // Phone (String)

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
    return <p>Connect your wallet</p>;
  }

  return (
    /* This is the create listing form. user can add picture either https://filecoin.io/ or https://arweave.org/ */
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create a New Listing</h2>

      <div className="relative mb-4">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 text-left">
          Home Address to Rent Out
          <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-500 bg-gray-200 rounded-full cursor-pointer" title="Enter the full address of the property you want to rent out.">
            ?
          </span>
        </label>
        <input
          type="text"
          id="address"
          placeholder="Enter the address of your property"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </div>

      <div className="relative mb-4">
        <label htmlFor="rentalRate" className="block text-sm font-medium text-gray-700 mb-1 text-left">
          Rental Rate per Hour
          <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-500 bg-gray-200 rounded-full cursor-pointer" title="Specify the hourly rental rate (in SOL, for ex 0.0345)">
            ?
          </span> https://www.coinbase.com/converter/sol/usd
        </label>
        <div className="flex items-center justify-start gap-2">
          <label htmlFor="rentalRate" className="text-gray-700">SOL</label>
          <input
            type="number"
            step="any"
            id="rentalRate"
            placeholder="e.g., 0.0345"
            value={rentalRate}
            onChange={e => setRentalRate(e.target.value)}
            className="input input-bordered w-1/4 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black text-left"
          />
          <span className="text-gray-700 ml-4">USD</span>
          <span className="text-gray-900 font-semibold">${(rentalRate === '' ? '0.00' : (Number(rentalRate) * 200).toFixed(2))}</span>
        </div>
      </div>

      <div className="relative mb-4">
        <label htmlFor="sensorId" className="block text-sm font-medium text-gray-700 mb-1 text-left flex items-center gap-2">
          Sensor ID
          <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-500 bg-gray-200 rounded-full cursor-pointer" title="Enter the unique ID for your sensor.">
            ?
          </span>
          <button
            type="button"
            className="ml-2 px-4 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-300 hover:bg-blue-200 text-xs"
            onClick={() => setSensorId('70B3D57ED0001A2B')}
          >
            Generate ID (for testing only)
          </button>
        </label>
        <input
          type="text"
          id="sensorId"
          placeholder="Enter your sensor ID"
          value={sensorId}
          onChange={(e) => setSensorId(e.target.value)}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </div>

      <div className="relative mb-4">
        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1 text-left">
          Latitude
          <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-500 bg-gray-200 rounded-full cursor-pointer" title="Enter the latitude coordinate of your property.">
            ?
          </span>
          <a href="https://www.gps-coordinates.net/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline ml-2">
            Get Coordinates
          </a>
        </label>
        <input
          type="number"
          id="latitude"
          placeholder="e.g., 37.7749"
          value={latitude || ''}
          onChange={(e) => setLatitude(Number(e.target.value))}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </div>

      <div className="relative mb-4">
        <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1 text-left">
          Longitude
          <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-500 bg-gray-200 rounded-full cursor-pointer" title="Enter the longitude coordinate of your property.">
            ?
          </span>
        </label>
        <input
          type="number"
          id="longitude"
          placeholder="e.g., -122.4194"
          value={longitude || ''}
          onChange={(e) => setLongitude(Number(e.target.value))}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </div>

      <div className="relative mb-4">
        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1 text-left">
          Additional Info (optional)
          <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-500 bg-gray-200 rounded-full cursor-pointer" title="Provide any additional information about your listing.">
            ?
          </span>
        </label>
        <textarea
          id="additionalInfo"
          placeholder="Provide any additional information about your listing"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className="textarea textarea-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </div>

      <div className="relative mb-4">
        <label htmlFor="availabilityStart" className="block text-sm font-medium text-gray-700 mb-1 text-left flex items-center gap-2">
          Availability Start
          <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-500 bg-gray-200 rounded-full cursor-pointer" title="Enter the start date and time of availability.">
            ?
          </span>
          <button
            type="button"
            className="ml-2 px-4 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-300 hover:bg-blue-200 text-xs"
            onClick={() => {
              const now = new Date();
              const pad = (n: number) => n.toString().padStart(2, '0');
              const formatted = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
              setAvailabilityStart(formatted);
            }}
          >
            Current Date/Time
          </button>
        </label>
        <input
          type="datetime-local"
          id="availabilityStart"
          placeholder="Availability Start"
          value={availabilityStart}
          onChange={(e) => setAvailabilityStart(e.target.value)}
          className="input input-bordered w-full border border-gray-300 rounded-md text-black focus:border-blue-500 focus:ring focus:ring-blue-200"
        />
      </div>

      <div className="relative mb-4">
        <label htmlFor="availabilityEnd" className="block text-sm font-medium text-gray-700 mb-1 text-left">
          Availability End
          <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-500 bg-gray-200 rounded-full cursor-pointer" title="Enter the end date and time of availability.">
            ?
          </span>
        </label>
        <input
          type="datetime-local"
          id="availabilityEnd"
          placeholder="Availability End"
          value={availabilityEnd}
          onChange={(e) => setAvailabilityEnd(e.target.value)}
          className="input input-bordered w-full border border-gray-300 rounded-md text-black focus:border-blue-500 focus:ring focus:ring-blue-200"
        />
      </div>


      <div className="relative mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 text-left">
          Email
          <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-500 bg-gray-200 rounded-full cursor-pointer" title="Enter your email address for contact.">
            ?
          </span>
        </label>
        <input
          type="email"
          id="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </div>

      <div className="relative mb-4">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 text-left">
          Phone
          <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-500 bg-gray-200 rounded-full cursor-pointer" title="Enter your phone number for contact.">
            ?
          </span>
        </label>
        <input
          type="tel"
          id="phone"
          placeholder="(123) 456-7890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input input-bordered w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
        />
      </div>



      <button
        className="bg-blue-500 text-white border-2 border-blue-700 hover:bg-blue-600 hover:border-blue-800 transition-all duration-300 ease-in-out px-6 py-3 rounded-lg shadow-lg w-full"
        onClick={handleSubmit}
        disabled={createListing.isPending || !formValid}
      >
        Create A Listing {createListing.isPending && "..."}
      </button>
    </div>



    /* End create listing form */

  );
}


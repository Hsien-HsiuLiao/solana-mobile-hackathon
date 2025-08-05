'use client'

import { PublicKey } from '@solana/web3.js'
import { Button } from 'react-native-paper';
import { Linking, Alert } from 'react-native';
import { useAppTheme } from '@/components/app-theme';

interface GpsNavigationButtonProps {
  address: string
  latitude: number
  longitude: number
}

export function GpsNavigationButton({ address, latitude, longitude }: GpsNavigationButtonProps) {
  const { spacing } = useAppTheme();

  const handleGpsNavigation = async () => {
    // Check if we have valid GPS coordinates
    const hasValidCoordinates = latitude !== 0 && longitude !== 0 && 
                               !isNaN(latitude) && !isNaN(longitude) &&
                               latitude >= -90 && latitude <= 90 &&
                               longitude >= -180 && longitude <= 180

    if (hasValidCoordinates) {
      // Show app selection dialog
      Alert.alert(
        'Choose Navigation App',
        'Select which app to use for navigation:',
        [
          {
            text: 'Google Maps',
            onPress: async () => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
              try {
                await Linking.openURL(url);
                console.log('Opened Google Maps with URL:', url);
              } catch (error) {
                console.log('Failed to open Google Maps:', error);
              }
            }
          },
          {
            text: 'Waze',
            onPress: async () => {
              const url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
              try {
                await Linking.openURL(url);
                console.log('Opened Waze with URL:', url);
              } catch (error) {
                console.log('Failed to open Waze:', error);
              }
            }
          },
          {
            text: 'Android Maps',
            onPress: async () => {
              const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(address || 'Parking Location')})`;
              try {
                await Linking.openURL(url);
                console.log('Opened Android Maps with URL:', url);
              } catch (error) {
                console.log('Failed to open Android Maps:', error);
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } else if (address && address.trim() !== '') {
      // Show app selection dialog for address
      Alert.alert(
        'Choose Navigation App',
        'Select which app to use for navigation:',
        [
          {
            text: 'Google Maps',
            onPress: async () => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
              try {
                await Linking.openURL(url);
                console.log('Opened Google Maps with URL:', url);
              } catch (error) {
                console.log('Failed to open Google Maps:', error);
              }
            }
          },
          {
            text: 'Waze',
            onPress: async () => {
              const url = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
              try {
                await Linking.openURL(url);
                console.log('Opened Waze with URL:', url);
              } catch (error) {
                console.log('Failed to open Waze:', error);
              }
            }
          },
          {
            text: 'Android Maps',
            onPress: async () => {
              const url = `geo:0,0?q=${encodeURIComponent(address)}`;
              try {
                await Linking.openURL(url);
                console.log('Opened Android Maps with URL:', url);
              } catch (error) {
                console.log('Failed to open Android Maps:', error);
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } else {
      console.log('No valid location information available for navigation.')
    }
  }

  const getButtonText = () => {
    const hasValidCoordinates = latitude !== 0 && longitude !== 0 && 
                               !isNaN(latitude) && !isNaN(longitude) &&
                               latitude >= -90 && latitude <= 90 &&
                               longitude >= -180 && longitude <= 180

    if (hasValidCoordinates) {
      return `Navigate to GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
    } else if (address && address.trim() !== '') {
      return `Navigate to Address (${address.length > 30 ? address.substring(0, 30) + '...' : address})`
    } else {
      return 'Navigate (No location data)'
    }
  }

  const isDisabled = () => {
    const hasValidCoordinates = latitude !== 0 && longitude !== 0 && 
                               !isNaN(latitude) && !isNaN(longitude) &&
                               latitude >= -90 && latitude <= 90 &&
                               longitude >= -180 && longitude <= 180

    return !hasValidCoordinates && (!address || address.trim() === '')
  }

  return (
    <Button
      mode="contained"
      onPress={handleGpsNavigation}
      disabled={isDisabled()}
      style={{ marginTop: spacing.sm }}
      icon="map-marker"
    >
      {getButtonText()}
    </Button>
  )
} 
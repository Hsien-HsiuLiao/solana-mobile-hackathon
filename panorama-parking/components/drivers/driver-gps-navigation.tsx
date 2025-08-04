'use client'

import { PublicKey } from '@solana/web3.js'
import { Button } from 'react-native-paper';
import { Linking } from 'react-native';
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
      // Use GPS coordinates for navigation (more accurate)
      const gpsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      try {
        const supported = await Linking.canOpenURL(gpsUrl);
        if (supported) {
          await Linking.openURL(gpsUrl);
        } else {
          console.log('Cannot open URL:', gpsUrl);
        }
      } catch (error) {
        console.error('Error opening GPS navigation:', error);
      }
      console.log('Opening GPS navigation with coordinates:', { latitude, longitude })
    } else if (address && address.trim() !== '') {
      // Fallback to address-based navigation
      const addressUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
      try {
        const supported = await Linking.canOpenURL(addressUrl);
        if (supported) {
          await Linking.openURL(addressUrl);
        } else {
          console.log('Cannot open URL:', addressUrl);
        }
      } catch (error) {
        console.error('Error opening address navigation:', error);
      }
      console.log('Opening GPS navigation with address:', address)
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
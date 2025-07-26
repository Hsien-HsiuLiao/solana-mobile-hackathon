import { WalletUiDropdown } from '@/components/solana/wallet-ui-dropdown'
import { Stack } from 'expo-router'
import React from 'react'

export default function HomeownersLayout() {
  return (
    <Stack screenOptions={{ headerTitle: 'Homeowner', headerRight: () => <WalletUiDropdown /> }}>
      <Stack.Screen name="index" />
    </Stack>
  )
} 
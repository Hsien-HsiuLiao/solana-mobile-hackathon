import { Stack } from 'expo-router';
import { WalletUiDropdown } from '@/components/solana/wallet-ui-dropdown';

export default function DriverLayout() {
  return (
    <Stack screenOptions={{ headerTitle: 'Drivers', headerRight: () => <WalletUiDropdown /> }}>
      <Stack.Screen name="index" />
    </Stack>
  );
} 
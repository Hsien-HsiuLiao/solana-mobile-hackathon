import { AppView } from '@/components/app-view';
import { AppText } from '@/components/app-text';
import { useAppTheme } from '@/components/app-theme';

// Blue debug panel for account matching and general debugging
export function BlueDebugPanel({ 
  accounts, 
  currentAccountListing, 
  publicKey, 
  program, 
  onRefresh, 
  onTestProgram 
}: {
  accounts: any;
  currentAccountListing: any;
  publicKey: any;
  program: any;
  onRefresh: () => void;
  onTestProgram: () => void;
}) {
  const { spacing } = useAppTheme();

  return (
    <AppView style={{ backgroundColor: '#e3f2fd', padding: spacing.md, borderRadius: 8, marginTop: spacing.sm, borderWidth: 1, borderColor: '#1976d2' }}>
      <AppText variant="titleMedium" style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: spacing.xs }}>
        🔍 Debug Info
      </AppText>
      <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
        Loading: {accounts.isLoading ? '🔄 Yes' : '✅ No'}
      </AppText>
      <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
        Accounts count: {accounts.data?.length || 0}
      </AppText>
      <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
        Current listing: {currentAccountListing ? '✅ Found' : '❌ Not found'}
      </AppText>
      <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
        Public key: {publicKey?.toString().slice(0, 8)}...
      </AppText>
      
      <AppText variant="bodyMedium" style={{ color: '#000', marginBottom: spacing.xs }}>
        Cluster: {accounts.data ? 'Connected' : 'Not connected'}
      </AppText>
      
      {accounts.data && accounts.data.length > 0 && (
        <AppView style={{ marginTop: spacing.xs }}>
          <AppText variant="bodyMedium" style={{ color: '#000', fontWeight: 'bold' }}>
            Found Accounts:
          </AppText>
          {accounts.data.map((acc: any, index: number) => (
            <AppText key={index} variant="bodySmall" style={{ color: '#000', marginLeft: spacing.xs }}>
              {index + 1}. Maker: {acc.account.maker.toString().slice(0, 8)}... | 
              {acc.account.maker.toString() === publicKey?.toString() ? ' ✅ MATCH' : ' ❌ No match'}
            </AppText>
          ))}
        </AppView>
      )}
      
      <AppView style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
        <AppText 
          variant="bodyMedium" 
          style={{ color: '#1976d2', fontWeight: 'bold', textDecorationLine: 'underline' }}
          onPress={onRefresh}
        >
          🔄 Refresh
        </AppText>
        <AppText 
          variant="bodyMedium" 
          style={{ color: '#d32f2f', fontWeight: 'bold', textDecorationLine: 'underline' }}
          onPress={onTestProgram}
        >
          🧪 Test Program
        </AppText>
      </AppView>
    </AppView>
  );
}

// Yellow debug panel for delete button troubleshooting
export function YellowDebugPanel({ 
  publicKey, 
  accountQuery, 
  deleteListing 
}: {
  publicKey: any;
  accountQuery: any;
  deleteListing: any;
}) {
  const { spacing } = useAppTheme();

  return (
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
  );
} 
import '../global.css'

import { PrivyProvider } from '@privy-io/expo'
import { AppIdentity, createSolanaDevnet, MobileWalletProvider } from '@wallet-ui/react-native-kit'
import { Slot } from 'expo-router'

const cluster = createSolanaDevnet()
const identity: AppIdentity = { name: 'Kit Expo Uniwind' }
const privyAppId = process.env.EXPO_PUBLIC_PRIVY_APP_ID
const privyClientId = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID

export default function Layout() {
  if (!privyAppId || !privyClientId) {
    throw new Error('Missing Privy environment variables')
  }

  return (
    <PrivyProvider appId={privyAppId} clientId={privyClientId}>
      <MobileWalletProvider cluster={cluster} identity={identity}>
        <Slot />
      </MobileWalletProvider>
    </PrivyProvider>
  )
}

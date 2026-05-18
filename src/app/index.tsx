import { useLoginWithSiws, usePrivy } from '@privy-io/expo'
import { fromUint8Array, useMobileWallet } from '@wallet-ui/react-native-kit'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

const siwsDomain = 'kit-expo-privy'
const siwsUri = 'acme://privy-login'

export default function App() {
  const { error: privyError, isReady, logout, user } = usePrivy()
  const { account, connect, disconnect, signMessages } = useMobileWallet()
  const { generateMessage, login } = useLoginWithSiws()
  const [error, setError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleDisconnect = async () => {
    setError(null)
    await logout()
    await disconnect()
  }

  const handleSignIn = async () => {
    setError(null)
    setIsSigningIn(true)

    try {
      const connectedAccount = account ?? (await connect())
      const walletAddress = connectedAccount.address.toString()
      const { message } = await generateMessage({
        from: {
          domain: siwsDomain,
          uri: siwsUri,
        },
        wallet: {
          address: walletAddress,
        },
      })
      const signatureBytes = await signMessages(new TextEncoder().encode(message))
      const signature = fromUint8Array(signatureBytes)

      await login({
        message,
        signature,
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to sign in with Privy')
    } finally {
      setIsSigningIn(false)
    }
  }

  const isLoggedIn = Boolean(user)

  return (
    <View className="flex-1 bg-white dark:bg-black items-center justify-center px-8">
      <Text className="text-4xl font-extrabold text-gray-800 dark:text-white mb-3 tracking-tight">Welcome</Text>

      <Text className="text-xl dark:text-white text-gray-700 mb-8 text-center leading-relaxed">
        Sign in with <Text className="text-blue-500 font-semibold">Privy + Solana MWA</Text>
      </Text>

      <View className="mb-8 items-center">
        {!isReady ? (
          <Text className="text-gray-600 dark:text-gray-400">Loading Privy...</Text>
        ) : privyError ? (
          <Text className="text-red-600 dark:text-red-400 text-center">{privyError.message}</Text>
        ) : isLoggedIn && account ? (
          <View className="items-center gap-4">
            <Text className="text-gray-600 dark:text-gray-400 mb-2">
              Connected: {account.label ? account.label : account.address.toString().slice(0, 8)}...
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 mb-2">Privy user: {user?.id}</Text>
            <Pressable className="bg-red-500 px-6 py-3 rounded-xl active:bg-red-600" onPress={handleDisconnect}>
              <Text className="text-white font-bold">Sign Out</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            className="bg-blue-600 px-6 py-3 rounded-xl active:bg-blue-700 disabled:opacity-60"
            disabled={isSigningIn}
            onPress={handleSignIn}
          >
            <Text className="text-white font-bold text-lg">
              {isSigningIn ? 'Signing In...' : 'Sign In With Wallet'}
            </Text>
          </Pressable>
        )}
      </View>

      {error ? <Text className="text-base text-red-600 dark:text-red-400 text-center max-w-sm">{error}</Text> : null}

      <StatusBar style="auto" />
    </View>
  )
}

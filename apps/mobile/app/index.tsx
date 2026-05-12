import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../src/stores/authStore'

export default function Index() {
  const router = useRouter()
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isInitialized) return

    // Small delay for splash feel
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(customer)/(tabs)')
      } else {
        router.replace('/(auth)/login')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [isInitialized, isAuthenticated])

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🍽️</Text>
      <Text style={styles.title}>Chakula</Text>
      <Text style={styles.subtitle}>Delicious food, delivered</Text>
      <ActivityIndicator
        size="large"
        color="#f97316"
        style={styles.spinner}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 40,
  },
  spinner: {
    marginTop: 20,
  },
})
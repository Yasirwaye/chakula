import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'

export default function RegisterScreen() {
  const router = useRouter()
  const { setupToken } = useLocalSearchParams<{ setupToken: string }>()
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleRegister = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Please enter your name'); return }
    if (!email.trim() || !email.includes('@')) { Alert.alert('Required', 'Enter a valid email'); return }
    if (!setupToken) { Alert.alert('Error', 'Session expired. Please try again.'); router.replace('/(auth)/login'); return }

    try {
      await register(setupToken, name.trim(), email.toLowerCase().trim())
      router.replace('/(customer)/(tabs)')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      Alert.alert('Error', err.response?.data?.message ?? 'Registration failed')
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.title}>Almost there!</Text>
          <Text style={styles.sub}>Tell us about yourself to get started</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Mwangi"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="john@example.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.hint}>We'll send order receipts here</Text>

          <TouchableOpacity
            style={[styles.btn, (isLoading || !name || !email) && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={isLoading || !name || !email}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Create Account</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, padding: 24, paddingTop: 80 },
  header: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 8 },
  sub: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  form: {},
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 16, fontSize: 16, color: '#111', borderWidth: 1, borderColor: '#e5e7eb',
  },
  hint: { fontSize: 13, color: '#9ca3af', marginTop: 6, marginBottom: 8 },
  btn: {
    backgroundColor: '#f97316', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
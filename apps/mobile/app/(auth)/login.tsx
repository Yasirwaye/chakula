import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'

export default function LoginScreen() {
  const router = useRouter()
  const { sendOtp, isLoading } = useAuthStore()
  const [phone, setPhone] = useState('')

  const handleSend = async () => {
    let formatted = phone.trim().replace(/\s/g, '')
    if (formatted.startsWith('0')) formatted = '+254' + formatted.slice(1)
    else if (!formatted.startsWith('+')) formatted = '+254' + formatted

    if (formatted.length < 12) {
      Alert.alert('Invalid Number', 'Please enter a valid Kenyan phone number')
      return
    }

    try {
      const result = await sendOtp(formatted)
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: formatted, maskedPhone: result.maskedPhone },
      })
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to send OTP')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>🍽️</Text>
          <Text style={styles.title}>Welcome to Chakula</Text>
          <Text style={styles.subtitle}>Enter your phone number to continue</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.flag}>
              <Text style={styles.flagText}>🇰🇪 +254</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="712 345 678"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              autoFocus
            />
          </View>
          <TouchableOpacity
            style={[styles.button, (isLoading || phone.length < 9) && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={isLoading || phone.length < 9}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Send Code</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          By continuing you agree to our{' '}
          <Text style={styles.termsLink}>Terms</Text> &{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, padding: 24, paddingTop: 80 },
  header: { alignItems: 'center', marginBottom: 48 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  inputGroup: { marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  phoneRow: { flexDirection: 'row', marginBottom: 16 },
  flag: {
    backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 14,
    justifyContent: 'center', marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb',
  },
  flagText: { fontSize: 15, fontWeight: '500', color: '#374151' },
  phoneInput: {
    flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 16, fontSize: 18, fontWeight: '500', color: '#111',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  button: {
    backgroundColor: '#f97316', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  terms: { textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 'auto' },
  termsLink: { color: '#f97316', fontWeight: '600' },
})
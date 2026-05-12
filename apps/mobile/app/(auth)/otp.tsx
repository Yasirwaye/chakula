import { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'

const OTP_LENGTH = 6

export default function OtpScreen() {
  const router = useRouter()
  const { phone, maskedPhone } = useLocalSearchParams<{ phone: string; maskedPhone: string }>()
  const { verifyOtp, sendOtp, isLoading } = useAuthStore()
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [countdown, setCountdown] = useState(60)
  const refs = useRef<Array<TextInput | null>>([])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  const handleChange = (val: string, idx: number) => {
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').split('').slice(0, OTP_LENGTH)
      const next = [...otp]
      digits.forEach((d, i) => { if (idx + i < OTP_LENGTH) next[idx + i] = d })
      setOtp(next)
      const focus = Math.min(idx + digits.length, OTP_LENGTH - 1)
      refs.current[focus]?.focus()
      if (next.every((d) => d !== '')) submit(next.join(''))
      return
    }
    const next = [...otp]
    next[idx] = val.replace(/\D/g, '')
    setOtp(next)
    if (val && idx < OTP_LENGTH - 1) refs.current[idx + 1]?.focus()
    if (val && idx === OTP_LENGTH - 1 && next.every((d) => d !== '')) submit(next.join(''))
  }

  const handleKey = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      const next = [...otp]
      next[idx - 1] = ''
      setOtp(next)
      refs.current[idx - 1]?.focus()
    }
  }

  const submit = async (code?: string) => {
    const finalOtp = code ?? otp.join('')
    if (finalOtp.length !== OTP_LENGTH || !phone) return
    try {
      const result = await verifyOtp(phone, finalOtp)
      if (result.isNewUser) {
        router.replace({ pathname: '/(auth)/register', params: { setupToken: result.setupToken } })
      } else {
        router.replace('/(customer)/(tabs)')
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      Alert.alert('Wrong Code', err.response?.data?.message ?? 'Invalid OTP. Try again.')
      setOtp(Array(OTP_LENGTH).fill(''))
      refs.current[0]?.focus()
    }
  }

  const resend = async () => {
    if (countdown > 0 || !phone) return
    try {
      await sendOtp(phone)
      setCountdown(60)
      setOtp(Array(OTP_LENGTH).fill(''))
      refs.current[0]?.focus()
    } catch {
      Alert.alert('Error', 'Failed to resend code')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.sub}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phone}>{maskedPhone ?? phone}</Text>
        </Text>

        <View style={styles.boxes}>
          {otp.map((d, i) => (
            <TextInput
              key={i}
              ref={(r) => { refs.current[i] = r }}
              style={[styles.box, d && styles.boxFilled]}
              value={d}
              onChangeText={(v) => handleChange(v, i)}
              onKeyPress={({ nativeEvent }) => handleKey(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={i === 0 ? OTP_LENGTH : 1}
              selectTextOnFocus
              autoFocus={i === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btn, (isLoading || otp.some((d) => !d)) && styles.btnDisabled]}
          onPress={() => submit()}
          disabled={isLoading || otp.some((d) => !d)}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Verify</Text>
          }
        </TouchableOpacity>

        <View style={styles.resendRow}>
          {countdown > 0
            ? <Text style={styles.resendText}>Resend in <Text style={styles.timer}>{countdown}s</Text></Text>
            : <TouchableOpacity onPress={resend}><Text style={styles.resendLink}>Resend Code</Text></TouchableOpacity>
          }
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  back: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 8 },
  backText: { fontSize: 16, color: '#f97316', fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 12 },
  sub: { fontSize: 16, color: '#6b7280', lineHeight: 24, marginBottom: 40 },
  phone: { fontWeight: '700', color: '#111' },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  box: {
    width: 50, height: 56, borderRadius: 12, borderWidth: 2,
    borderColor: '#e5e7eb', textAlign: 'center', fontSize: 24,
    fontWeight: '700', color: '#111', backgroundColor: '#f9fafb',
  },
  boxFilled: { borderColor: '#f97316', backgroundColor: '#fff7ed' },
  btn: { backgroundColor: '#f97316', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 24 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendRow: { alignItems: 'center' },
  resendText: { fontSize: 14, color: '#9ca3af' },
  timer: { fontWeight: '700', color: '#f97316' },
  resendLink: { fontSize: 16, fontWeight: '700', color: '#f97316' },
})
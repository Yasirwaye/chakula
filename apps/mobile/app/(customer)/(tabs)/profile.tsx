import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuthStore } from '../../../src/stores/authStore'
export default function ProfileScreen() {
  const { user, logout } = useAuthStore()
  return (
    <View style={styles.c}>
      <Text style={styles.avatar}>👤</Text>
      <Text style={styles.name}>{user?.name ?? 'User'}</Text>
      <Text style={styles.info}>{user?.phone}</Text>
      <Text style={styles.info}>{user?.email}</Text>
      <TouchableOpacity style={styles.btn} onPress={logout}>
        <Text style={styles.btnText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  avatar: { fontSize: 64, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 4 },
  info: { fontSize: 15, color: '#6b7280', marginBottom: 2 },
  btn: { marginTop: 32, backgroundColor: '#ef4444', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
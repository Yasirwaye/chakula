import { View, Text, StyleSheet } from 'react-native'
export default function OrdersScreen() {
  return (
    <View style={styles.c}>
      <Text style={styles.t}>📋 Orders</Text>
      <Text style={styles.s}>Coming in Sprint 4</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  t: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  s: { fontSize: 15, color: '#9ca3af' },
})
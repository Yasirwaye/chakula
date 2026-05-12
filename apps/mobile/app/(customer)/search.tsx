import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { searchApi } from '../../src/lib/api'

export default function SearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const { data, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  })

  const { data: trendingData } = useQuery({
    queryKey: ['trending'],
    queryFn: () => searchApi.trending(),
    staleTime: 5 * 60 * 1000,
  })

  const results = data?.data?.data
  const trending = trendingData?.data?.data?.trending ?? []

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Search restaurants or dishes..."
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          autoFocus
          clearButtonMode="while-editing"
        />
        {isFetching && <ActivityIndicator size="small" color="#f97316" style={styles.spinner} />}
      </View>

      {query.length < 2 ? (
        // Empty state — show trending
        <View style={styles.empty}>
          <Text style={styles.trendingTitle}>🔥 Trending Searches</Text>
          {trending.map((term: string) => (
            <TouchableOpacity key={term} style={styles.trendingItem} onPress={() => setQuery(term)}>
              <Text style={styles.trendingIcon}>🔍</Text>
              <Text style={styles.trendingText}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        // Results
        <FlatList
          data={[
            ...(results?.restaurants ?? []).map((r: { id: string; name: string; slug: string; avgRating: number }) => ({ ...r, _type: 'restaurant' })),
            ...(results?.dishes ?? []).map((d: { id: string; name: string; basePrice: number }) => ({ ...d, _type: 'dish' })),
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem}>
              <Text style={styles.resultIcon}>{item._type === 'restaurant' ? '🍽️' : '🥘'}</Text>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultSub}>
                  {item._type === 'restaurant'
                    ? `⭐ ${(item as { avgRating: number }).avgRating}`
                    : `KES ${(item as { basePrice: number }).basePrice}`
                  }
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !isFetching
              ? <View style={styles.noResults}><Text style={styles.noResultsText}>No results for "{query}"</Text></View>
              : null
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: { padding: 8, marginRight: 4 },
  backText: { fontSize: 22, color: '#111' },
  input: { flex: 1, fontSize: 16, color: '#111', paddingVertical: 8 },
  spinner: { marginLeft: 8 },
  empty: { padding: 20 },
  trendingTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 16 },
  trendingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  trendingIcon: { fontSize: 16, marginRight: 12, color: '#9ca3af' },
  trendingText: { fontSize: 15, color: '#374151' },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  resultIcon: { fontSize: 28, marginRight: 14 },
  resultInfo: {},
  resultName: { fontSize: 16, fontWeight: '600', color: '#111' },
  resultSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  noResults: { padding: 32, alignItems: 'center' },
  noResultsText: { fontSize: 16, color: '#6b7280' },
})
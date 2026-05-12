import { useCallback, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, FlatList,
  Image, Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { restaurantApi } from '../../../src/lib/api'
import { useLocationStore } from '../../../src/stores/locationStore'
import { useAuthStore } from '../../../src/stores/authStore'
import { formatAmount } from '@chakula/shared-utils'

const { width } = Dimensions.get('window')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOOD CHIPS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MOODS = [
  { id: 'COMFORT_FOOD', emoji: '😴', label: 'Comfort food' },
  { id: 'QUICK_BITE', emoji: '⚡', label: 'Quick bite' },
  { id: 'DATE_NIGHT', emoji: '💑', label: 'Date night' },
  { id: 'HEALTHY', emoji: '🌱', label: 'Healthy' },
  { id: 'ADVENTUROUS', emoji: '🌍', label: 'Adventurous' },
  { id: 'BUDGET_FRIENDLY', emoji: '💰', label: 'Budget' },
  { id: 'CELEBRATION', emoji: '🎉', label: 'Celebrate' },
  { id: 'SPICY', emoji: '🌶️', label: 'Spicy' },
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUISINE CATEGORIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CUISINES = [
  { id: 'LOCAL_KENYAN', emoji: '🍲', label: 'Local' },
  { id: 'BURGERS', emoji: '🍔', label: 'Burgers' },
  { id: 'PIZZA', emoji: '🍕', label: 'Pizza' },
  { id: 'GRILLS_BBQ', emoji: '🥩', label: 'Grills' },
  { id: 'HEALTHY', emoji: '🥗', label: 'Healthy' },
  { id: 'DESSERTS', emoji: '🍰', label: 'Desserts' },
  { id: 'BEVERAGES', emoji: '🥤', label: 'Drinks' },
  { id: 'FAST_FOOD', emoji: '🍟', label: 'Fast Food' },
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESTAURANT CARD COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function RestaurantCard({ restaurant, onPress }: {
  restaurant: {
    id: string
    name: string
    slug: string
    logo: string | null
    coverImage: string | null
    cuisineTypes: string[]
    avgRating: number
    distanceKm: number
    estimatedDeliveryMinutes: number
    deliveryFee: number
    isOpen: boolean
    closesAt: string | null
    isFavorited: boolean
    minimumOrder: number
  }
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      {/* Cover Image */}
      <View style={styles.cardImage}>
        {restaurant.coverImage ? (
          <Image source={{ uri: restaurant.coverImage }} style={styles.coverImg} />
        ) : (
          <View style={[styles.coverImg, styles.coverPlaceholder]}>
            <Text style={styles.coverEmoji}>🍽️</Text>
          </View>
        )}
        {/* Open/Closed badge */}
        <View style={[styles.statusBadge, restaurant.isOpen ? styles.openBadge : styles.closedBadge]}>
          <Text style={styles.statusText}>{restaurant.isOpen ? '🟢 Open' : '🔴 Closed'}</Text>
        </View>
        {/* Heart */}
        <TouchableOpacity style={styles.heartBtn}>
          <Text style={styles.heartIcon}>{restaurant.isFavorited ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.cardCuisine} numberOfLines={1}>
          {restaurant.cuisineTypes.join(' • ')} • {restaurant.distanceKm}km away
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaItem}>⭐ {restaurant.avgRating.toFixed(1)}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaItem}>🕒 {restaurant.estimatedDeliveryMinutes} min</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaItem}>🛵 {formatAmount(restaurant.deliveryFee)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SKELETON LOADER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SkeletonCard() {
  return (
    <View style={[styles.card, styles.skeleton]}>
      <View style={[styles.coverImg, styles.skeletonBlock]} />
      <View style={styles.cardInfo}>
        <View style={[styles.skeletonLine, { width: '70%' }]} />
        <View style={[styles.skeletonLine, { width: '50%', marginTop: 6 }]} />
        <View style={[styles.skeletonLine, { width: '80%', marginTop: 6 }]} />
      </View>
    </View>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOME SCREEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function HomeScreen() {
  const router = useRouter()
  const { latitude, longitude, city } = useLocationStore()
  const { user } = useAuthStore()
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['homeData', latitude, longitude],
    queryFn: () => restaurantApi.getHomeData(latitude ?? undefined, longitude ?? undefined),
    staleTime: 5 * 60 * 1000,
  })

  const homeData = data?.data?.data

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const goToRestaurant = (slug: string) => {
    router.push(`/(customer)/restaurant/${slug}`)
  }

  const goToSearch = () => {
    router.push('/(customer)/search')
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#f97316"
          colors={['#f97316']}
        />
      }
    >
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.deliverTo}>Deliver to</Text>
          <TouchableOpacity style={styles.locationRow}>
            <Text style={styles.locationText}>📍 {city}</Text>
            <Text style={styles.locationChevron}> ▼</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Text style={styles.notifIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* ── GREETING ── */}
      <Text style={styles.greeting}>
        {user ? `Hey ${user.name.split(' ')[0]}! 👋` : 'Good day! 👋'}
      </Text>
      <Text style={styles.greetingSub}>What are you craving today?</Text>

      {/* ── SEARCH BAR ── */}
      <TouchableOpacity style={styles.searchBar} onPress={goToSearch} activeOpacity={0.8}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search restaurants or dishes...</Text>
      </TouchableOpacity>

      {/* ── MOOD SELECTOR ── */}
      <Text style={styles.sectionTitle}>How are you feeling?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
        {MOODS.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[styles.moodChip, selectedMood === mood.id && styles.moodChipActive]}
            onPress={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={[styles.moodLabel, selectedMood === mood.id && styles.moodLabelActive]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── BANNERS ── */}
      {homeData?.banners && homeData.banners.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.bannerScroll}
        >
          {homeData.banners.map((banner: { id: string; title: string; subtitle: string | null; imageUrl: string }) => (
            <TouchableOpacity key={banner.id} style={styles.banner} activeOpacity={0.95}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                {banner.subtitle && (
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── CUISINES ── */}
      <Text style={styles.sectionTitle}>What are you in the mood for?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cuisineScroll}>
        {CUISINES.map((cuisine) => (
          <TouchableOpacity key={cuisine.id} style={styles.cuisineItem}>
            <View style={styles.cuisineCircle}>
              <Text style={styles.cuisineEmoji}>{cuisine.emoji}</Text>
            </View>
            <Text style={styles.cuisineLabel}>{cuisine.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── NEAR YOU ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Near You 📍</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </ScrollView>
      ) : homeData?.nearbyRestaurants?.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
          {homeData.nearbyRestaurants.map((r: Parameters<typeof RestaurantCard>[0]['restaurant']) => (
            <RestaurantCard key={r.id} restaurant={r} onPress={() => goToRestaurant(r.slug)} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🏙️</Text>
          <Text style={styles.emptyText}>No restaurants in your area yet</Text>
          <Text style={styles.emptySubtext}>We're growing! Check back soon.</Text>
        </View>
      )}

      {/* ── TRENDING ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending Now 🔥</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </ScrollView>
      ) : homeData?.trendingRestaurants?.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
          {homeData.trendingRestaurants.map((r: Parameters<typeof RestaurantCard>[0]['restaurant']) => (
            <RestaurantCard key={r.id} restaurant={r} onPress={() => goToRestaurant(r.slug)} />
          ))}
        </ScrollView>
      ) : null}

      {/* ── NEW ON CHAKULA ── */}
      {homeData?.newRestaurants?.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New on Chakula ✨</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
            {homeData.newRestaurants.map((r: Parameters<typeof RestaurantCard>[0]['restaurant']) => (
              <RestaurantCard key={r.id} restaurant={r} onPress={() => goToRestaurant(r.slug)} />
            ))}
          </ScrollView>
        </>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

const CARD_WIDTH = width * 0.72

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  scrollContent: { paddingBottom: 20 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  deliverTo: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locationText: { fontSize: 16, fontWeight: '700', color: '#111' },
  locationChevron: { fontSize: 12, color: '#6b7280' },
  notifBtn: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 20 },
  notifIcon: { fontSize: 20 },

  // Greeting
  greeting: { fontSize: 22, fontWeight: '700', color: '#111', paddingHorizontal: 20, paddingTop: 16 },
  greetingSub: { fontSize: 15, color: '#6b7280', paddingHorizontal: 20, marginTop: 2, marginBottom: 16 },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchPlaceholder: { fontSize: 15, color: '#9ca3af', flex: 1 },

  // Moods
  moodScroll: { paddingLeft: 20, marginBottom: 20 },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  moodChipActive: { backgroundColor: '#fff7ed', borderColor: '#f97316' },
  moodEmoji: { fontSize: 16, marginRight: 6 },
  moodLabel: { fontSize: 13, color: '#374151', fontWeight: '500' },
  moodLabelActive: { color: '#f97316', fontWeight: '700' },

  // Banners
  bannerScroll: { paddingLeft: 20, marginBottom: 20 },
  banner: {
    width: width - 48,
    height: 120,
    backgroundColor: '#f97316',
    borderRadius: 16,
    marginRight: 12,
    justifyContent: 'center',
    padding: 20,
    overflow: 'hidden',
  },
  bannerContent: {},
  bannerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  // Cuisines
  cuisineScroll: { paddingLeft: 20, marginBottom: 8 },
  cuisineItem: { alignItems: 'center', marginRight: 20 },
  cuisineCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cuisineEmoji: { fontSize: 26 },
  cuisineLabel: { fontSize: 12, color: '#374151', marginTop: 6, fontWeight: '500' },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', paddingHorizontal: 20, marginBottom: 12, marginTop: 8 },
  seeAll: { fontSize: 14, color: '#f97316', fontWeight: '600' },

  // Restaurant cards
  cardScroll: { paddingLeft: 20, marginBottom: 8 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: { position: 'relative' },
  coverImg: { width: '100%', height: 140, backgroundColor: '#f3f4f6' },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  coverEmoji: { fontSize: 48 },
  statusBadge: {
    position: 'absolute', top: 10, left: 10,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  openBadge: { backgroundColor: 'rgba(16,185,129,0.9)' },
  closedBadge: { backgroundColor: 'rgba(239,68,68,0.9)' },
  statusText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  heartBtn: { position: 'absolute', top: 10, right: 10, padding: 6, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20 },
  heartIcon: { fontSize: 18 },
  cardInfo: { padding: 12 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 2 },
  cardCuisine: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { fontSize: 12, color: '#374151', fontWeight: '500' },
  metaDot: { fontSize: 12, color: '#d1d5db', marginHorizontal: 4 },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },

  // Skeleton
  skeleton: { opacity: 1 },
  skeletonBlock: { backgroundColor: '#f3f4f6' },
  skeletonLine: { height: 14, backgroundColor: '#f3f4f6', borderRadius: 7, marginBottom: 4 },
})
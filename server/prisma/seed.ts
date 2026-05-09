import {
  PrismaClient,
  UserRole,
  UserStatus,
  RestaurantStatus,
  CuisineType,
  MoodTag,
  PromoType,
} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...\n')

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. ADMIN USER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const admin = await prisma.user.upsert({
    where: { phone: '+254700000000' },
    update: {},
    create: {
      name: 'Chakula Admin',
      email: 'admin@chakula.com',
      phone: '+254700000000',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isPhoneVerified: true,
      isEmailVerified: true,
    },
  })
  console.log('✅ Admin created:', admin.id)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. TEST CUSTOMER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const customer = await prisma.user.upsert({
    where: { phone: '+254712345678' },
    update: {},
    create: {
      name: 'John Mwangi',
      email: 'john@test.com',
      phone: '+254712345678',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      isPhoneVerified: true,
    },
  })
  console.log('✅ Test customer created:', customer.id)

  // Customer address
  const existingAddress = await prisma.address.findFirst({
    where: { userId: customer.id },
  })

  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: customer.id,
        type: 'HOME',
        label: 'Home',
        formattedAddress: '123 Westlands Road, Nairobi',
        area: 'Westlands',
        city: 'Nairobi',
        country: 'KE',
        latitude: -1.2676,
        longitude: 36.8108,
        instructions: 'Ring the bell, 3rd floor apartment 3B',
        landmark: 'Near KFC Westlands',
        isDefault: true,
      },
    })
    console.log('✅ Customer address created')
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. TEST RESTAURANT OWNER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const restaurantOwner = await prisma.user.upsert({
    where: { phone: '+254723456789' },
    update: {},
    create: {
      name: 'Mama Grace',
      email: 'grace@mamaskitchen.co.ke',
      phone: '+254723456789',
      role: UserRole.RESTAURANT,
      status: UserStatus.ACTIVE,
      isPhoneVerified: true,
      isEmailVerified: true,
    },
  })
  console.log('✅ Restaurant owner created:', restaurantOwner.id)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. TEST RESTAURANT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'mamas-kitchen' },
    update: {},
    create: {
      ownerId: restaurantOwner.id,
      name: "Mama's Kitchen",
      slug: 'mamas-kitchen',
      description:
        'Authentic home-cooked Kenyan meals made with love. From nyama choma to ugali, we bring the taste of home to your doorstep.',
      story:
        "Mama Grace started cooking for the neighborhood back in 2018. What started as a small home kitchen has grown into one of Westlands' most loved restaurants. Every dish is made with the same love and care she gives her own family.",
      phone: '+254723456789',
      email: 'info@mamaskitchen.co.ke',
      instagramHandle: 'mamaskitchenke',
      formattedAddress: '45 Westlands Road, Nairobi',
      area: 'Westlands',
      city: 'Nairobi',
      country: 'KE',
      latitude: -1.268,
      longitude: 36.81,
      cuisineTypes: [
        CuisineType.LOCAL_KENYAN,
        CuisineType.AFRICAN,
        CuisineType.GRILLS_BBQ,
      ],
      tags: ['family-friendly', 'nyama-choma', 'homemade', 'local-favorite'],
      isHalalCertified: true,
      isVegetarianFriendly: true,
      minimumOrder: 300,
      deliveryFeeBase: 80,
      deliveryFeePerKm: 20,
      deliveryRadiusKm: 8,
      avgPrepTimeMinutes: 25,
      commissionPercent: 18,
      status: RestaurantStatus.APPROVED,
      isActive: true,
      isVerified: true,
      isFeatured: true,
      payoutMethod: 'MPESA',
      payoutPhone: '+254723456789',
      operatingHours: {
        mon: { open: '08:00', close: '22:00', closed: false },
        tue: { open: '08:00', close: '22:00', closed: false },
        wed: { open: '08:00', close: '22:00', closed: false },
        thu: { open: '08:00', close: '22:00', closed: false },
        fri: { open: '08:00', close: '23:00', closed: false },
        sat: { open: '09:00', close: '23:00', closed: false },
        sun: { open: '10:00', close: '21:00', closed: false },
      },
      avgRating: 4.7,
      totalReviews: 342,
      totalOrders: 1234,
      totalRevenue: 1345200,
    },
  })
  console.log('✅ Restaurant created:', restaurant.id)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. SECOND TEST RESTAURANT (for variety on home screen)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const owner2 = await prisma.user.upsert({
    where: { phone: '+254734567890' },
    update: {},
    create: {
      name: 'Chef Marco',
      email: 'marco@pizzapalace.co.ke',
      phone: '+254734567890',
      role: UserRole.RESTAURANT,
      status: UserStatus.ACTIVE,
      isPhoneVerified: true,
    },
  })

  const restaurant2 = await prisma.restaurant.upsert({
    where: { slug: 'pizza-palace' },
    update: {},
    create: {
      ownerId: owner2.id,
      name: 'Pizza Palace',
      slug: 'pizza-palace',
      description:
        'Authentic Italian-style pizzas baked in a wood-fired oven. Fresh ingredients, bold flavors.',
      phone: '+254734567890',
      email: 'hello@pizzapalace.co.ke',
      formattedAddress: '12 Ngong Road, Nairobi',
      area: 'Kilimani',
      city: 'Nairobi',
      country: 'KE',
      latitude: -1.2952,
      longitude: 36.7822,
      cuisineTypes: [CuisineType.PIZZA, CuisineType.ITALIAN],
      tags: ['wood-fired', 'italian', 'pizza'],
      minimumOrder: 500,
      deliveryFeeBase: 100,
      deliveryFeePerKm: 25,
      deliveryRadiusKm: 6,
      avgPrepTimeMinutes: 30,
      commissionPercent: 18,
      status: RestaurantStatus.APPROVED,
      isActive: true,
      isVerified: true,
      isFeatured: false,
      payoutMethod: 'MPESA',
      payoutPhone: '+254734567890',
      operatingHours: {
        mon: { open: '11:00', close: '23:00', closed: false },
        tue: { open: '11:00', close: '23:00', closed: false },
        wed: { open: '11:00', close: '23:00', closed: false },
        thu: { open: '11:00', close: '23:00', closed: false },
        fri: { open: '11:00', close: '00:00', closed: false },
        sat: { open: '11:00', close: '00:00', closed: false },
        sun: { open: '12:00', close: '22:00', closed: false },
      },
      avgRating: 4.5,
      totalReviews: 187,
      totalOrders: 892,
      totalRevenue: 892000,
    },
  })
  console.log('✅ Restaurant 2 created:', restaurant2.id)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. TEST RIDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const riderUser = await prisma.user.upsert({
    where: { phone: '+254745678901' },
    update: {},
    create: {
      name: 'Brian Kamau',
      email: 'brian@rider.com',
      phone: '+254745678901',
      role: UserRole.RIDER,
      status: UserStatus.ACTIVE,
      isPhoneVerified: true,
    },
  })

  const existingRider = await prisma.rider.findUnique({
    where: { userId: riderUser.id },
  })

  if (!existingRider) {
    await prisma.rider.create({
      data: {
        userId: riderUser.id,
        status: 'APPROVED',
        vehicleType: 'MOTORCYCLE',
        vehicleMake: 'Honda',
        vehicleModel: 'CB150',
        vehicleYear: 2021,
        vehicleColor: 'Red',
        vehiclePlate: 'KBX 234G',
        isOnline: false,
        isAvailable: false,
        avgRating: 4.9,
        totalRatings: 234,
        totalDeliveries: 847,
        completionRate: 98.5,
        acceptanceRate: 92.3,
        totalEarnings: 245600,
        pendingEarnings: 12400,
        approvedAt: new Date(),
        approvedBy: admin.id,
      },
    })
    console.log('✅ Test rider created')
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. MENU CATEGORIES — MAMA'S KITCHEN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const existingCategories = await prisma.menuCategory.findMany({
    where: { restaurantId: restaurant.id },
  })

  let starters, mains, sides, drinks, desserts

  if (existingCategories.length === 0) {
    ;[starters, mains, sides, drinks, desserts] = await Promise.all([
      prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Starters',
          description: 'Start your meal right',
          sortOrder: 1,
        },
      }),
      prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Main Course',
          description: 'Hearty main dishes',
          sortOrder: 2,
        },
      }),
      prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Sides',
          description: 'Perfect accompaniments',
          sortOrder: 3,
        },
      }),
      prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Drinks',
          description: 'Refresh yourself',
          sortOrder: 4,
        },
      }),
      prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Desserts',
          description: 'Sweet endings',
          sortOrder: 5,
        },
      }),
    ])
    console.log('✅ Menu categories created (5)')
  } else {
    starters = existingCategories.find((c) => c.name === 'Starters')!
    mains = existingCategories.find((c) => c.name === 'Main Course')!
    sides = existingCategories.find((c) => c.name === 'Sides')!
    drinks = existingCategories.find((c) => c.name === 'Drinks')!
    desserts = existingCategories.find((c) => c.name === 'Desserts')!
    console.log('✅ Menu categories already exist — skipping')
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. MENU ITEMS — MAMA'S KITCHEN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const existingItems = await prisma.menuItem.findMany({
    where: { restaurantId: restaurant.id },
  })

  if (existingItems.length === 0 && starters && mains && sides && drinks && desserts) {
    await Promise.all([
      // ── STARTERS ──
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: starters.id,
          name: 'Chicken Wings (6pcs)',
          description:
            'Crispy chicken wings with your choice of sauce. Served hot and fresh with a side of blue cheese dip.',
          basePrice: 380,
          isSpicy: true,
          isChefsPick: true,
          isPopular: true,
          moodTags: [MoodTag.COMFORT_FOOD, MoodTag.SHARING, MoodTag.LATE_NIGHT],
          prepTimeMinutes: 20,
          calories: 650,
          sortOrder: 1,
          customizationGroups: [
            {
              id: 'sauce',
              name: 'Sauce Choice',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'buffalo', name: 'Buffalo Hot', priceModifier: 0 },
                { id: 'bbq', name: 'BBQ Sauce', priceModifier: 0 },
                { id: 'lemon-pepper', name: 'Lemon Pepper', priceModifier: 0 },
                { id: 'honey-garlic', name: 'Honey Garlic', priceModifier: 0 },
              ],
            },
            {
              id: 'quantity',
              name: 'Quantity',
              type: 'RADIO',
              required: true,
              options: [
                { id: '6pcs', name: '6 pieces', priceModifier: 0 },
                { id: '12pcs', name: '12 pieces', priceModifier: 380 },
              ],
            },
          ],
          totalOrders: 234,
          avgRating: 4.9,
        },
      }),

      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: starters.id,
          name: 'Samosa (4pcs)',
          description:
            'Crispy golden samosas filled with spiced minced meat or vegetables. Served with tamarind chutney.',
          basePrice: 200,
          isVegetarian: false,
          sortOrder: 2,
          customizationGroups: [
            {
              id: 'filling',
              name: 'Filling',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'meat', name: 'Minced Meat', priceModifier: 0 },
                { id: 'veg', name: 'Vegetable', priceModifier: 0 },
              ],
            },
          ],
          totalOrders: 145,
          avgRating: 4.6,
        },
      }),

      // ── MAIN COURSE ──
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: mains.id,
          name: 'Nyama Choma (500g)',
          description:
            'Freshly grilled beef, seasoned with traditional Kenyan spices. Served with kachumbari and ugali.',
          basePrice: 700,
          isChefsPick: true,
          isPopular: true,
          moodTags: [MoodTag.CELEBRATION, MoodTag.SHARING, MoodTag.COMFORT_FOOD],
          prepTimeMinutes: 40,
          sortOrder: 1,
          customizationGroups: [
            {
              id: 'meat-type',
              name: 'Meat Type',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'beef', name: 'Beef', priceModifier: 0 },
                { id: 'goat', name: 'Goat', priceModifier: 100 },
                { id: 'chicken', name: 'Whole Chicken', priceModifier: 200 },
              ],
            },
            {
              id: 'weight',
              name: 'Weight',
              type: 'RADIO',
              required: true,
              options: [
                { id: '500g', name: '500g', priceModifier: 0 },
                { id: '1kg', name: '1kg', priceModifier: 700 },
              ],
            },
            {
              id: 'extras',
              name: 'Add-ons',
              type: 'CHECKBOX',
              required: false,
              options: [
                { id: 'ugali', name: 'Ugali', priceModifier: 80 },
                { id: 'kachumbari', name: 'Extra Kachumbari', priceModifier: 50 },
                { id: 'sauce', name: 'Piri Piri Sauce', priceModifier: 50 },
              ],
            },
          ],
          totalOrders: 456,
          avgRating: 4.8,
        },
      }),

      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: mains.id,
          name: 'Ugali + Beef Stew',
          description:
            'Classic Kenyan comfort food. Smooth ugali served with rich, slow-cooked beef stew and sukuma wiki.',
          basePrice: 450,
          isPopular: true,
          moodTags: [MoodTag.COMFORT_FOOD, MoodTag.BUDGET_FRIENDLY, MoodTag.HEALTHY],
          prepTimeMinutes: 15,
          calories: 750,
          sortOrder: 2,
          customizationGroups: [
            {
              id: 'protein',
              name: 'Protein Choice',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'beef', name: 'Beef Stew', priceModifier: 0 },
                { id: 'chicken', name: 'Chicken Stew', priceModifier: 50 },
                { id: 'fish', name: 'Tilapia Stew', priceModifier: 100 },
                { id: 'vegetables', name: 'Vegetable Stew', priceModifier: -50 },
              ],
            },
            {
              id: 'sides',
              name: 'Add Sides',
              type: 'CHECKBOX',
              required: false,
              options: [
                { id: 'sukuma', name: 'Sukuma Wiki', priceModifier: 50 },
                { id: 'beans', name: 'Beans', priceModifier: 60 },
                { id: 'cabbage', name: 'Steamed Cabbage', priceModifier: 40 },
              ],
            },
          ],
          totalOrders: 389,
          avgRating: 4.7,
        },
      }),

      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: mains.id,
          name: 'Grilled Tilapia',
          description:
            'Fresh whole tilapia, seasoned and grilled to perfection. Served with ugali and vegetables.',
          basePrice: 650,
          isChefsPick: false,
          moodTags: [MoodTag.HEALTHY, MoodTag.DATE_NIGHT],
          prepTimeMinutes: 35,
          sortOrder: 3,
          customizationGroups: [
            {
              id: 'cooking-style',
              name: 'Cooking Style',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'grilled', name: 'Grilled', priceModifier: 0 },
                { id: 'fried', name: 'Fried', priceModifier: 0 },
                { id: 'stewed', name: 'Stewed', priceModifier: 0 },
              ],
            },
          ],
          totalOrders: 198,
          avgRating: 4.6,
        },
      }),

      // ── SIDES ──
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: sides.id,
          name: 'Chips Masala',
          description:
            'Crispy fries tossed with aromatic masala spices, peppers and tomatoes. A Kenyan street food classic.',
          basePrice: 250,
          isSpicy: true,
          isPopular: true,
          isVegetarian: true,
          moodTags: [MoodTag.QUICK_BITE, MoodTag.BUDGET_FRIENDLY, MoodTag.LATE_NIGHT],
          prepTimeMinutes: 15,
          sortOrder: 1,
          customizationGroups: [
            {
              id: 'spice-level',
              name: 'Spice Level',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'mild', name: 'Mild', priceModifier: 0 },
                { id: 'medium', name: 'Medium 🌶️', priceModifier: 0 },
                { id: 'hot', name: 'Hot 🌶️🌶️', priceModifier: 0 },
              ],
            },
          ],
          totalOrders: 198,
          avgRating: 4.6,
        },
      }),

      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: sides.id,
          name: 'Steamed Rice',
          description: 'Fluffy steamed white rice. Perfect with any stew.',
          basePrice: 100,
          isVegetarian: true,
          isVegan: true,
          sortOrder: 2,
          customizationGroups: [],
          totalOrders: 267,
          avgRating: 4.4,
        },
      }),

      // ── DRINKS ──
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: drinks.id,
          name: 'Fresh Juice',
          description: 'Freshly squeezed fruit juice made to order. No preservatives.',
          basePrice: 150,
          isVegetarian: true,
          isVegan: true,
          moodTags: [MoodTag.HEALTHY, MoodTag.QUICK_BITE],
          prepTimeMinutes: 5,
          sortOrder: 1,
          customizationGroups: [
            {
              id: 'flavor',
              name: 'Flavor',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'passion', name: 'Passion Fruit', priceModifier: 0 },
                { id: 'mango', name: 'Mango', priceModifier: 0 },
                { id: 'watermelon', name: 'Watermelon', priceModifier: 0 },
                { id: 'avocado', name: 'Avocado', priceModifier: 30 },
                { id: 'mix', name: 'Mix (2 fruits)', priceModifier: 30 },
              ],
            },
            {
              id: 'size',
              name: 'Size',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'small', name: 'Small (300ml)', priceModifier: 0 },
                { id: 'large', name: 'Large (500ml)', priceModifier: 50 },
              ],
            },
          ],
          totalOrders: 145,
          avgRating: 4.8,
        },
      }),

      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: drinks.id,
          name: 'Soda',
          description: 'Chilled soft drink. Choose your favourite.',
          basePrice: 80,
          sortOrder: 2,
          customizationGroups: [
            {
              id: 'type',
              name: 'Type',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'coke', name: 'Coca-Cola', priceModifier: 0 },
                { id: 'fanta', name: 'Fanta Orange', priceModifier: 0 },
                { id: 'sprite', name: 'Sprite', priceModifier: 0 },
                { id: 'stoney', name: 'Stoney Ginger Beer', priceModifier: 0 },
              ],
            },
          ],
          totalOrders: 312,
          avgRating: 4.3,
        },
      }),

      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: drinks.id,
          name: 'Chai (Kenyan Tea)',
          description:
            'Traditional Kenyan spiced tea brewed with milk. The real deal.',
          basePrice: 60,
          isVegetarian: true,
          sortOrder: 3,
          customizationGroups: [
            {
              id: 'sweetness',
              name: 'Sweetness',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'no-sugar', name: 'No Sugar', priceModifier: 0 },
                { id: 'less-sugar', name: 'Less Sugar', priceModifier: 0 },
                { id: 'normal', name: 'Normal', priceModifier: 0 },
                { id: 'extra-sweet', name: 'Extra Sweet', priceModifier: 0 },
              ],
            },
          ],
          totalOrders: 423,
          avgRating: 4.9,
        },
      }),

      // ── DESSERTS ──
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: desserts.id,
          name: 'Mandazi (4pcs)',
          description:
            'Traditional East African doughnuts, lightly sweetened with coconut milk. Served warm.',
          basePrice: 120,
          isVegetarian: true,
          moodTags: [MoodTag.COMFORT_FOOD, MoodTag.BUDGET_FRIENDLY],
          prepTimeMinutes: 10,
          sortOrder: 1,
          customizationGroups: [],
          totalOrders: 178,
          avgRating: 4.7,
        },
      }),
    ])
    console.log('✅ Menu items created (10)')
  } else {
    console.log('✅ Menu items already exist — skipping')
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9. PIZZA PALACE MENU
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const existingPizzaCategories = await prisma.menuCategory.findMany({
    where: { restaurantId: restaurant2.id },
  })

  if (existingPizzaCategories.length === 0) {
    const pizzaCat = await prisma.menuCategory.create({
      data: {
        restaurantId: restaurant2.id,
        name: 'Pizzas',
        description: 'Wood-fired artisan pizzas',
        sortOrder: 1,
      },
    })

    const pastacat = await prisma.menuCategory.create({
      data: {
        restaurantId: restaurant2.id,
        name: 'Pasta',
        description: 'Freshly made pasta dishes',
        sortOrder: 2,
      },
    })

    const drinksCat2 = await prisma.menuCategory.create({
      data: {
        restaurantId: restaurant2.id,
        name: 'Drinks',
        sortOrder: 3,
      },
    })

    await Promise.all([
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant2.id,
          categoryId: pizzaCat.id,
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato sauce, fresh mozzarella, and basil.',
          basePrice: 750,
          isVegetarian: true,
          isChefsPick: true,
          isPopular: true,
          moodTags: [MoodTag.DATE_NIGHT, MoodTag.SHARING],
          sortOrder: 1,
          customizationGroups: [
            {
              id: 'size',
              name: 'Size',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'small', name: 'Small (8")', priceModifier: 0 },
                { id: 'medium', name: 'Medium (10")', priceModifier: 200 },
                { id: 'large', name: 'Large (12")', priceModifier: 400 },
              ],
            },
            {
              id: 'crust',
              name: 'Crust',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'thin', name: 'Thin Crust', priceModifier: 0 },
                { id: 'thick', name: 'Thick Crust', priceModifier: 0 },
              ],
            },
            {
              id: 'extras',
              name: 'Extra Toppings',
              type: 'CHECKBOX',
              required: false,
              options: [
                { id: 'extra-cheese', name: 'Extra Cheese', priceModifier: 100 },
                { id: 'olives', name: 'Olives', priceModifier: 80 },
                { id: 'mushrooms', name: 'Mushrooms', priceModifier: 80 },
              ],
            },
          ],
          totalOrders: 234,
          avgRating: 4.7,
        },
      }),

      prisma.menuItem.create({
        data: {
          restaurantId: restaurant2.id,
          categoryId: pizzaCat.id,
          name: 'Pepperoni Pizza',
          description:
            'Loaded with premium pepperoni, tomato sauce, and mozzarella. A crowd favourite.',
          basePrice: 900,
          isPopular: true,
          moodTags: [MoodTag.COMFORT_FOOD, MoodTag.LATE_NIGHT],
          sortOrder: 2,
          customizationGroups: [
            {
              id: 'size',
              name: 'Size',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'small', name: 'Small (8")', priceModifier: 0 },
                { id: 'medium', name: 'Medium (10")', priceModifier: 200 },
                { id: 'large', name: 'Large (12")', priceModifier: 400 },
              ],
            },
          ],
          totalOrders: 312,
          avgRating: 4.8,
        },
      }),

      prisma.menuItem.create({
        data: {
          restaurantId: restaurant2.id,
          categoryId: pastacat.id,
          name: 'Spaghetti Bolognese',
          description: 'Al dente spaghetti with rich meat sauce and parmesan.',
          basePrice: 650,
          moodTags: [MoodTag.COMFORT_FOOD, MoodTag.DATE_NIGHT],
          sortOrder: 1,
          customizationGroups: [],
          totalOrders: 145,
          avgRating: 4.5,
        },
      }),

      prisma.menuItem.create({
        data: {
          restaurantId: restaurant2.id,
          categoryId: drinksCat2.id,
          name: 'Soft Drink',
          description: 'Chilled bottled soft drink.',
          basePrice: 100,
          sortOrder: 1,
          customizationGroups: [
            {
              id: 'type',
              name: 'Type',
              type: 'RADIO',
              required: true,
              options: [
                { id: 'coke', name: 'Coca-Cola', priceModifier: 0 },
                { id: 'sprite', name: 'Sprite', priceModifier: 0 },
                { id: 'fanta', name: 'Fanta', priceModifier: 0 },
              ],
            },
          ],
          totalOrders: 189,
          avgRating: 4.2,
        },
      }),
    ])
    console.log('✅ Pizza Palace menu created')
  } else {
    console.log('✅ Pizza Palace menu already exists — skipping')
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 10. PROMO CODES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  await Promise.all([
    prisma.promoCode.upsert({
      where: { code: 'FIRST50' },
      update: {},
      create: {
        code: 'FIRST50',
        description: '50% off first order (max KES 200)',
        customerDescription: '50% off your first order!',
        type: PromoType.PERCENTAGE,
        discountValue: 50,
        maxDiscountAmount: 200,
        minimumOrderAmount: 300,
        firstOrderOnly: true,
        usageLimit: 10000,
        usageLimitPerUser: 1,
        validFrom: new Date(),
        isActive: true,
        createdBy: admin.id,
      },
    }),

    prisma.promoCode.upsert({
      where: { code: 'FREEDEL' },
      update: {},
      create: {
        code: 'FREEDEL',
        description: 'Free delivery on any order',
        customerDescription: 'Free delivery on your order!',
        type: PromoType.FREE_DELIVERY,
        discountValue: 0,
        minimumOrderAmount: 500,
        usageLimitPerUser: 3,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdBy: admin.id,
      },
    }),

    prisma.promoCode.upsert({
      where: { code: 'CHAKULA100' },
      update: {},
      create: {
        code: 'CHAKULA100',
        description: 'KES 100 off any order over KES 800',
        customerDescription: 'KES 100 off orders over KES 800',
        type: PromoType.FIXED_AMOUNT,
        discountValue: 100,
        minimumOrderAmount: 800,
        usageLimitPerUser: 2,
        usageLimit: 500,
        validFrom: new Date(),
        isActive: true,
        createdBy: admin.id,
      },
    }),
  ])
  console.log('✅ Promo codes created (3)')

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 11. APP CONFIG
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const configs = [
    { key: 'service_fee_fixed', value: 50, description: 'Fixed service fee per order (KES)', isPublic: true },
    { key: 'default_commission_percent', value: 18, description: 'Default restaurant commission %', isPublic: false },
    { key: 'base_delivery_fee', value: 80, description: 'Base delivery fee (KES)', isPublic: true },
    { key: 'delivery_fee_per_km', value: 20, description: 'Additional fee per km above 2km', isPublic: true },
    { key: 'max_delivery_radius_km', value: 15, description: 'Max delivery radius in km', isPublic: true },
    { key: 'order_timeout_minutes', value: 2, description: 'Minutes restaurant has to accept order', isPublic: false },
    { key: 'otp_expiry_minutes', value: 5, description: 'OTP validity in minutes', isPublic: false },
    { key: 'maintenance_mode', value: false, description: 'Put app in maintenance mode', isPublic: true },
    { key: 'min_app_version_ios', value: '1.0.0', description: 'Minimum iOS app version required', isPublic: true },
    { key: 'min_app_version_android', value: '1.0.0', description: 'Minimum Android app version required', isPublic: true },
    { key: 'rider_earnings_per_km', value: 25, description: 'Rider earns KES per km delivered', isPublic: false },
    { key: 'rider_base_earning', value: 80, description: 'Rider base earning per delivery (KES)', isPublic: false },
    { key: 'support_phone', value: '+254700000001', description: 'Support phone number', isPublic: true },
    { key: 'support_email', value: 'support@chakula.com', description: 'Support email', isPublic: true },
    { key: 'rider_assignment_radius_km', value: 3, description: 'Initial radius to search for riders (km)', isPublic: false },
    { key: 'rider_assignment_max_riders', value: 3, description: 'Max riders to broadcast request to', isPublic: false },
    { key: 'rider_acceptance_timeout_seconds', value: 30, description: 'Seconds rider has to accept request', isPublic: false },
  ]

  await Promise.all(
    configs.map((config) =>
      prisma.appConfig.upsert({
        where: { key: config.key },
        update: { value: config.value },
        create: {
          key: config.key,
          value: config.value,
          description: config.description,
          isPublic: config.isPublic,
          updatedBy: admin.id,
        },
      })
    )
  )
  console.log('✅ App configs seeded (17)')

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 12. APP BANNERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const existingBanners = await prisma.appBanner.findMany()

  if (existingBanners.length === 0) {
    await Promise.all([
      prisma.appBanner.create({
        data: {
          title: 'Welcome to Chakula! 🎉',
          subtitle: '50% off your first order with code FIRST50',
          imageUrl: 'https://placehold.co/800x300/f97316/white?text=Welcome+to+Chakula',
          actionType: 'PROMO',
          actionValue: 'FIRST50',
          isActive: true,
          sortOrder: 1,
        },
      }),
      prisma.appBanner.create({
        data: {
          title: "Mama's Kitchen is Here! 🍽️",
          subtitle: 'Authentic Kenyan home cooking delivered to you',
          imageUrl: 'https://placehold.co/800x300/10b981/white?text=Mama+Kitchen',
          actionType: 'RESTAURANT',
          actionValue: restaurant.id,
          isActive: true,
          sortOrder: 2,
        },
      }),
      prisma.appBanner.create({
        data: {
          title: 'Free Delivery! 🛵',
          subtitle: 'Use code FREEDEL on orders over KES 500',
          imageUrl: 'https://placehold.co/800x300/3b82f6/white?text=Free+Delivery',
          actionType: 'PROMO',
          actionValue: 'FREEDEL',
          isActive: true,
          sortOrder: 3,
        },
      }),
    ])
    console.log('✅ App banners created (3)')
  } else {
    console.log('✅ App banners already exist — skipping')
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SUMMARY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n🌱 Seed complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('TEST ACCOUNTS:')
  console.log('  Admin:      +254700000000')
  console.log('  Customer:   +254712345678')
  console.log('  Restaurant: +254723456789  (Mama\'s Kitchen)')
  console.log('  Restaurant: +254734567890  (Pizza Palace)')
  console.log('  Rider:      +254745678901  (Brian Kamau)')
  console.log('\nPROMO CODES:')
  console.log("  FIRST50     → 50% off first order (max KES 200)")
  console.log("  FREEDEL     → Free delivery (min KES 500)")
  console.log("  CHAKULA100  → KES 100 off (min KES 800)")
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
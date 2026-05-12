import { z } from 'zod';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMMON VALIDATORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const uuidSchema = z.string().uuid('Invalid ID format');
export const phoneSchema = z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +254712345678)');
export const kenyaPhoneSchema = z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^(\+254|0)[17]\d{8}$/, 'Invalid Kenyan phone number')
    .transform((val) => {
    // Normalize to +254 format
    if (val.startsWith('0')) {
        return '+254' + val.slice(1);
    }
    return val;
});
export const emailSchema = z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim();
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
export const coordinatesSchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const sendOtpSchema = z.object({
    phone: kenyaPhoneSchema,
});
export const verifyOtpSchema = z.object({
    phone: kenyaPhoneSchema,
    otp: z
        .string()
        .length(6, 'OTP must be 6 digits')
        .regex(/^\d{6}$/, 'OTP must contain only numbers'),
    deviceId: z.string().optional(),
    deviceName: z.string().max(100).optional(),
    deviceOS: z.string().max(50).optional(),
    pushToken: z.string().optional(),
});
export const registerSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name too long')
        .trim(),
    email: emailSchema,
    deviceId: z.string().optional(),
    deviceName: z.string().max(100).optional(),
    deviceOS: z.string().max(50).optional(),
    pushToken: z.string().optional(),
});
export const googleAuthSchema = z.object({
    idToken: z.string().min(1, 'Google ID token is required'),
    deviceId: z.string().optional(),
    pushToken: z.string().optional(),
});
export const appleAuthSchema = z.object({
    identityToken: z.string().min(1, 'Apple identity token is required'),
    authorizationCode: z.string().min(1, 'Authorization code is required'),
    fullName: z
        .object({
        givenName: z.string().nullable().optional(),
        familyName: z.string().nullable().optional(),
    })
        .optional(),
    email: emailSchema.optional(),
    deviceId: z.string().optional(),
    pushToken: z.string().optional(),
});
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});
export const logoutSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
    logoutAll: z.boolean().default(false),
});
export const restaurantLoginSchema = z.object({
    email: emailSchema,
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password too long'),
});
export const restaurantRegisterSchema = z.object({
    email: emailSchema,
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password too long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
    name: z.string().min(2).max(50).trim(),
    phone: kenyaPhoneSchema,
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const updateProfileSchema = z.object({
    name: z.string().min(2).max(50).trim().optional(),
    email: emailSchema.optional(),
    preferredLanguage: z.enum(['en', 'sw']).optional(),
    pushEnabled: z.boolean().optional(),
});
export const updatePushTokenSchema = z.object({
    pushToken: z.string().min(1, 'Push token is required'),
    deviceId: z.string().min(1, 'Device ID is required'),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADDRESS SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const createAddressSchema = z.object({
    type: z.enum(['HOME', 'WORK', 'OTHER']),
    label: z.string().max(50).optional(),
    formattedAddress: z.string().min(5, 'Address is required').max(500),
    apartment: z.string().max(100).optional(),
    area: z.string().max(100).optional(),
    city: z.string().min(2).max(100),
    county: z.string().max(100).optional(),
    country: z.string().length(2).default('KE'),
    postalCode: z.string().max(20).optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    instructions: z.string().max(500).optional(),
    landmark: z.string().max(200).optional(),
    isDefault: z.boolean().default(false),
});
export const updateAddressSchema = createAddressSchema.partial();
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORDER SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const chosenCustomizationSchema = z.object({
    groupId: z.string().min(1),
    chosen: z.array(z.object({
        optionId: z.string().min(1),
    })),
});
export const orderItemSchema = z.object({
    menuItemId: uuidSchema,
    quantity: z.number().int().min(1).max(20),
    chosenCustomizations: z.array(chosenCustomizationSchema).default([]),
    specialNote: z.string().max(200).optional(),
});
export const createOrderSchema = z.object({
    restaurantId: uuidSchema,
    items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
    deliveryAddressId: uuidSchema,
    deliveryType: z.enum(['ASAP', 'SCHEDULED']).default('ASAP'),
    scheduledFor: z.string().datetime().optional(),
    paymentMethod: z.enum(['MPESA', 'AIRTEL_MONEY', 'CARD', 'CASH']),
    mpesaPhone: kenyaPhoneSchema.optional(),
    airtelPhone: kenyaPhoneSchema.optional(),
    promoCode: z.string().max(50).optional(),
    specialInstructions: z.string().max(500).optional(),
    cutleryIncluded: z.boolean().default(false),
})
    .refine((data) => {
    if (data.paymentMethod === 'MPESA' && !data.mpesaPhone) {
        return false;
    }
    return true;
}, { message: 'M-Pesa phone number is required', path: ['mpesaPhone'] })
    .refine((data) => {
    if (data.paymentMethod === 'AIRTEL_MONEY' && !data.airtelPhone) {
        return false;
    }
    return true;
}, { message: 'Airtel phone number is required', path: ['airtelPhone'] })
    .refine((data) => {
    if (data.deliveryType === 'SCHEDULED' && !data.scheduledFor) {
        return false;
    }
    return true;
}, { message: 'Scheduled time is required', path: ['scheduledFor'] });
export const cancelOrderSchema = z.object({
    reason: z.string().max(500).optional(),
});
export const validateOrderSchema = z.object({
    restaurantId: uuidSchema,
    items: z.array(orderItemSchema).min(1),
    deliveryAddressId: uuidSchema,
    promoCode: z.string().max(50).optional(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REVIEW SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const createReviewSchema = z.object({
    orderId: uuidSchema,
    restaurantId: uuidSchema.optional(),
    riderId: uuidSchema.optional(),
    overallRating: z.number().min(1).max(5),
    foodRating: z.number().min(1).max(5).optional(),
    packagingRating: z.number().min(1).max(5).optional(),
    valueRating: z.number().min(1).max(5).optional(),
    deliveryRating: z.number().min(1).max(5).optional(),
    riderRating: z.number().min(1).max(5).optional(),
    comment: z.string().max(1000).optional(),
    restaurantTags: z.array(z.string()).max(10).default([]),
    riderTags: z.array(z.string()).max(10).default([]),
    itemRatings: z
        .array(z.object({
        menuItemId: uuidSchema,
        rating: z.number().min(1).max(5),
    }))
        .optional(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MENU SCHEMAS (Restaurant Dashboard)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const customizationOptionSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(100),
    priceModifier: z.number().min(0),
});
export const customizationGroupSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(100),
    type: z.enum(['RADIO', 'CHECKBOX']),
    required: z.boolean(),
    options: z
        .array(customizationOptionSchema)
        .min(1, 'Must have at least one option'),
});
export const createMenuItemSchema = z.object({
    categoryId: uuidSchema,
    name: z.string().min(2).max(100).trim(),
    description: z.string().min(10).max(1000).trim(),
    basePrice: z.number().min(1, 'Price must be greater than 0'),
    prepTimeMinutes: z.number().int().min(1).max(180).optional(),
    isSpicy: z.boolean().default(false),
    isVegetarian: z.boolean().default(false),
    isVegan: z.boolean().default(false),
    isGlutenFree: z.boolean().default(false),
    isChefsPick: z.boolean().default(false),
    isAvailable: z.boolean().default(true),
    moodTags: z
        .array(z.enum([
        'COMFORT_FOOD',
        'QUICK_BITE',
        'DATE_NIGHT',
        'HEALTHY',
        'ADVENTUROUS',
        'BUDGET_FRIENDLY',
        'CELEBRATION',
        'POST_WORKOUT',
        'SPICY',
        'SHARING',
        'LATE_NIGHT',
        'BREAKFAST',
    ]))
        .default([]),
    calories: z.number().int().min(0).optional(),
    allergens: z.array(z.string()).default([]),
    customizationGroups: z.array(customizationGroupSchema).default([]),
    sortOrder: z.number().int().min(0).default(0),
});
export const updateMenuItemSchema = createMenuItemSchema.partial();
export const createMenuCategorySchema = z.object({
    name: z.string().min(2).max(100).trim(),
    description: z.string().max(500).optional(),
    sortOrder: z.number().int().min(0).default(0),
});
export const updateMenuCategorySchema = createMenuCategorySchema.partial();
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESTAURANT SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const dayHoursSchema = z.object({
    open: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)'),
    close: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)'),
    closed: z.boolean(),
});
export const operatingHoursSchema = z.object({
    mon: dayHoursSchema,
    tue: dayHoursSchema,
    wed: dayHoursSchema,
    thu: dayHoursSchema,
    fri: dayHoursSchema,
    sat: dayHoursSchema,
    sun: dayHoursSchema,
});
export const updateRestaurantSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().min(10).max(2000).optional(),
    story: z.string().max(5000).optional(),
    phone: kenyaPhoneSchema.optional(),
    email: emailSchema.optional(),
    website: z.string().url().optional().or(z.literal('')),
    instagramHandle: z.string().max(50).optional(),
    facebookUrl: z.string().url().optional().or(z.literal('')),
    minimumOrder: z.number().min(0).optional(),
    deliveryFeeBase: z.number().min(0).optional(),
    deliveryFeePerKm: z.number().min(0).optional(),
    deliveryRadiusKm: z.number().min(1).max(50).optional(),
    avgPrepTimeMinutes: z.number().int().min(5).max(120).optional(),
    isHalalCertified: z.boolean().optional(),
    isVegetarianFriendly: z.boolean().optional(),
    isVeganFriendly: z.boolean().optional(),
    operatingHours: operatingHoursSchema.optional(),
    payoutMethod: z.enum(['MPESA', 'BANK']).optional(),
    payoutPhone: kenyaPhoneSchema.optional(),
    payoutBankName: z.string().max(100).optional(),
    payoutAccountNumber: z.string().max(50).optional(),
    payoutAccountName: z.string().max(100).optional(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIDER SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const updateRiderLocationSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    heading: z.number().min(0).max(360).optional(),
    speed: z.number().min(0).optional(),
    accuracy: z.number().min(0).optional(),
});
export const updateRiderStatusSchema = z.object({
    isOnline: z.boolean(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPPORT SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const createSupportTicketSchema = z.object({
    orderId: uuidSchema.optional(),
    category: z.enum([
        'ORDER_ISSUE',
        'PAYMENT_ISSUE',
        'DELIVERY_ISSUE',
        'RESTAURANT_ISSUE',
        'ACCOUNT_ISSUE',
        'REFUND_REQUEST',
        'GENERAL_INQUIRY',
        'OTHER',
    ]),
    subject: z.string().min(5).max(200).trim(),
    message: z.string().min(10).max(5000).trim(),
});
export const createTicketMessageSchema = z.object({
    message: z.string().min(1).max(5000).trim(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROMO SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const validatePromoSchema = z.object({
    code: z.string().min(1).max(50).toUpperCase(),
    restaurantId: uuidSchema,
    orderSubtotal: z.number().min(0),
});
export const createPromoSchema = z.object({
    code: z
        .string()
        .min(3)
        .max(20)
        .toUpperCase()
        .regex(/^[A-Z0-9]+$/, 'Code must be alphanumeric'),
    description: z.string().max(500).optional(),
    customerDescription: z.string().max(200).optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_DELIVERY', 'FIRST_ORDER']),
    discountValue: z.number().min(0),
    maxDiscountAmount: z.number().min(0).optional(),
    minimumOrderAmount: z.number().min(0).default(0),
    newUsersOnly: z.boolean().default(false),
    firstOrderOnly: z.boolean().default(false),
    usageLimit: z.number().int().min(1).optional(),
    usageLimitPerUser: z.number().int().min(1).default(1),
    validFrom: z.string().datetime(),
    validTo: z.string().datetime().optional(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COLLECTION SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const createCollectionSchema = z.object({
    name: z.string().min(1).max(100).trim(),
    description: z.string().max(500).optional(),
    emoji: z.string().max(10).optional(),
    isPublic: z.boolean().default(false),
});
export const addCollectionItemSchema = z.object({
    menuItemId: uuidSchema,
    note: z.string().max(200).optional(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const approveRestaurantSchema = z.object({
    commissionPercent: z.number().min(0).max(50).default(18),
    notes: z.string().max(500).optional(),
});
export const rejectRestaurantSchema = z.object({
    reason: z.string().min(10).max(1000),
});
export const suspendRestaurantSchema = z.object({
    reason: z.string().min(10).max(1000),
    suspendedUntil: z.string().datetime().optional(),
});
export const updateCommissionSchema = z.object({
    commissionPercent: z.number().min(0).max(50),
    reason: z.string().max(500).optional(),
});
export const broadcastNotificationSchema = z.object({
    title: z.string().min(1).max(100),
    body: z.string().min(1).max(500),
    target: z.string().min(1),
    data: z.record(z.string()).optional(),
    scheduleFor: z.string().datetime().optional(),
});
//# sourceMappingURL=index.js.map
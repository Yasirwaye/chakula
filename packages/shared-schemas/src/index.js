"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastNotificationSchema = exports.updateCommissionSchema = exports.suspendRestaurantSchema = exports.rejectRestaurantSchema = exports.approveRestaurantSchema = exports.addCollectionItemSchema = exports.createCollectionSchema = exports.createPromoSchema = exports.validatePromoSchema = exports.createTicketMessageSchema = exports.createSupportTicketSchema = exports.updateRiderStatusSchema = exports.updateRiderLocationSchema = exports.updateRestaurantSchema = exports.operatingHoursSchema = exports.dayHoursSchema = exports.updateMenuCategorySchema = exports.createMenuCategorySchema = exports.updateMenuItemSchema = exports.createMenuItemSchema = exports.customizationGroupSchema = exports.customizationOptionSchema = exports.createReviewSchema = exports.validateOrderSchema = exports.cancelOrderSchema = exports.createOrderSchema = exports.orderItemSchema = exports.chosenCustomizationSchema = exports.updateAddressSchema = exports.createAddressSchema = exports.updatePushTokenSchema = exports.updateProfileSchema = exports.restaurantRegisterSchema = exports.restaurantLoginSchema = exports.logoutSchema = exports.refreshTokenSchema = exports.appleAuthSchema = exports.googleAuthSchema = exports.registerSchema = exports.verifyOtpSchema = exports.sendOtpSchema = exports.coordinatesSchema = exports.paginationSchema = exports.emailSchema = exports.kenyaPhoneSchema = exports.phoneSchema = exports.uuidSchema = void 0;
const zod_1 = require("zod");
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMMON VALIDATORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.uuidSchema = zod_1.z.string().uuid('Invalid ID format');
exports.phoneSchema = zod_1.z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +254712345678)');
exports.kenyaPhoneSchema = zod_1.z
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
exports.emailSchema = zod_1.z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim();
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
});
exports.coordinatesSchema = zod_1.z.object({
    lat: zod_1.z.coerce.number().min(-90).max(90),
    lng: zod_1.z.coerce.number().min(-180).max(180),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.sendOtpSchema = zod_1.z.object({
    phone: exports.kenyaPhoneSchema,
});
exports.verifyOtpSchema = zod_1.z.object({
    phone: exports.kenyaPhoneSchema,
    otp: zod_1.z
        .string()
        .length(6, 'OTP must be 6 digits')
        .regex(/^\d{6}$/, 'OTP must contain only numbers'),
    deviceId: zod_1.z.string().optional(),
    deviceName: zod_1.z.string().max(100).optional(),
    deviceOS: zod_1.z.string().max(50).optional(),
    pushToken: zod_1.z.string().optional(),
});
exports.registerSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name too long')
        .trim(),
    email: exports.emailSchema,
    deviceId: zod_1.z.string().optional(),
    deviceName: zod_1.z.string().max(100).optional(),
    deviceOS: zod_1.z.string().max(50).optional(),
    pushToken: zod_1.z.string().optional(),
});
exports.googleAuthSchema = zod_1.z.object({
    idToken: zod_1.z.string().min(1, 'Google ID token is required'),
    deviceId: zod_1.z.string().optional(),
    pushToken: zod_1.z.string().optional(),
});
exports.appleAuthSchema = zod_1.z.object({
    identityToken: zod_1.z.string().min(1, 'Apple identity token is required'),
    authorizationCode: zod_1.z.string().min(1, 'Authorization code is required'),
    fullName: zod_1.z
        .object({
        givenName: zod_1.z.string().nullable().optional(),
        familyName: zod_1.z.string().nullable().optional(),
    })
        .optional(),
    email: exports.emailSchema.optional(),
    deviceId: zod_1.z.string().optional(),
    pushToken: zod_1.z.string().optional(),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.logoutSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
    logoutAll: zod_1.z.boolean().default(false),
});
exports.restaurantLoginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password too long'),
});
exports.restaurantRegisterSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password too long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
    name: zod_1.z.string().min(2).max(50).trim(),
    phone: exports.kenyaPhoneSchema,
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50).trim().optional(),
    email: exports.emailSchema.optional(),
    preferredLanguage: zod_1.z.enum(['en', 'sw']).optional(),
    pushEnabled: zod_1.z.boolean().optional(),
});
exports.updatePushTokenSchema = zod_1.z.object({
    pushToken: zod_1.z.string().min(1, 'Push token is required'),
    deviceId: zod_1.z.string().min(1, 'Device ID is required'),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADDRESS SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.createAddressSchema = zod_1.z.object({
    type: zod_1.z.enum(['HOME', 'WORK', 'OTHER']),
    label: zod_1.z.string().max(50).optional(),
    formattedAddress: zod_1.z.string().min(5, 'Address is required').max(500),
    apartment: zod_1.z.string().max(100).optional(),
    area: zod_1.z.string().max(100).optional(),
    city: zod_1.z.string().min(2).max(100),
    county: zod_1.z.string().max(100).optional(),
    country: zod_1.z.string().length(2).default('KE'),
    postalCode: zod_1.z.string().max(20).optional(),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    instructions: zod_1.z.string().max(500).optional(),
    landmark: zod_1.z.string().max(200).optional(),
    isDefault: zod_1.z.boolean().default(false),
});
exports.updateAddressSchema = exports.createAddressSchema.partial();
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORDER SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.chosenCustomizationSchema = zod_1.z.object({
    groupId: zod_1.z.string().min(1),
    chosen: zod_1.z.array(zod_1.z.object({
        optionId: zod_1.z.string().min(1),
    })),
});
exports.orderItemSchema = zod_1.z.object({
    menuItemId: exports.uuidSchema,
    quantity: zod_1.z.number().int().min(1).max(20),
    chosenCustomizations: zod_1.z.array(exports.chosenCustomizationSchema).default([]),
    specialNote: zod_1.z.string().max(200).optional(),
});
exports.createOrderSchema = zod_1.z.object({
    restaurantId: exports.uuidSchema,
    items: zod_1.z.array(exports.orderItemSchema).min(1, 'Order must have at least one item'),
    deliveryAddressId: exports.uuidSchema,
    deliveryType: zod_1.z.enum(['ASAP', 'SCHEDULED']).default('ASAP'),
    scheduledFor: zod_1.z.string().datetime().optional(),
    paymentMethod: zod_1.z.enum(['MPESA', 'AIRTEL_MONEY', 'CARD', 'CASH']),
    mpesaPhone: exports.kenyaPhoneSchema.optional(),
    airtelPhone: exports.kenyaPhoneSchema.optional(),
    promoCode: zod_1.z.string().max(50).optional(),
    specialInstructions: zod_1.z.string().max(500).optional(),
    cutleryIncluded: zod_1.z.boolean().default(false),
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
exports.cancelOrderSchema = zod_1.z.object({
    reason: zod_1.z.string().max(500).optional(),
});
exports.validateOrderSchema = zod_1.z.object({
    restaurantId: exports.uuidSchema,
    items: zod_1.z.array(exports.orderItemSchema).min(1),
    deliveryAddressId: exports.uuidSchema,
    promoCode: zod_1.z.string().max(50).optional(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REVIEW SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.createReviewSchema = zod_1.z.object({
    orderId: exports.uuidSchema,
    restaurantId: exports.uuidSchema.optional(),
    riderId: exports.uuidSchema.optional(),
    overallRating: zod_1.z.number().min(1).max(5),
    foodRating: zod_1.z.number().min(1).max(5).optional(),
    packagingRating: zod_1.z.number().min(1).max(5).optional(),
    valueRating: zod_1.z.number().min(1).max(5).optional(),
    deliveryRating: zod_1.z.number().min(1).max(5).optional(),
    riderRating: zod_1.z.number().min(1).max(5).optional(),
    comment: zod_1.z.string().max(1000).optional(),
    restaurantTags: zod_1.z.array(zod_1.z.string()).max(10).default([]),
    riderTags: zod_1.z.array(zod_1.z.string()).max(10).default([]),
    itemRatings: zod_1.z
        .array(zod_1.z.object({
        menuItemId: exports.uuidSchema,
        rating: zod_1.z.number().min(1).max(5),
    }))
        .optional(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MENU SCHEMAS (Restaurant Dashboard)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.customizationOptionSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1).max(100),
    priceModifier: zod_1.z.number().min(0),
});
exports.customizationGroupSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1).max(100),
    type: zod_1.z.enum(['RADIO', 'CHECKBOX']),
    required: zod_1.z.boolean(),
    options: zod_1.z
        .array(exports.customizationOptionSchema)
        .min(1, 'Must have at least one option'),
});
exports.createMenuItemSchema = zod_1.z.object({
    categoryId: exports.uuidSchema,
    name: zod_1.z.string().min(2).max(100).trim(),
    description: zod_1.z.string().min(10).max(1000).trim(),
    basePrice: zod_1.z.number().min(1, 'Price must be greater than 0'),
    prepTimeMinutes: zod_1.z.number().int().min(1).max(180).optional(),
    isSpicy: zod_1.z.boolean().default(false),
    isVegetarian: zod_1.z.boolean().default(false),
    isVegan: zod_1.z.boolean().default(false),
    isGlutenFree: zod_1.z.boolean().default(false),
    isChefsPick: zod_1.z.boolean().default(false),
    isAvailable: zod_1.z.boolean().default(true),
    moodTags: zod_1.z
        .array(zod_1.z.enum([
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
    calories: zod_1.z.number().int().min(0).optional(),
    allergens: zod_1.z.array(zod_1.z.string()).default([]),
    customizationGroups: zod_1.z.array(exports.customizationGroupSchema).default([]),
    sortOrder: zod_1.z.number().int().min(0).default(0),
});
exports.updateMenuItemSchema = exports.createMenuItemSchema.partial();
exports.createMenuCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).trim(),
    description: zod_1.z.string().max(500).optional(),
    sortOrder: zod_1.z.number().int().min(0).default(0),
});
exports.updateMenuCategorySchema = exports.createMenuCategorySchema.partial();
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESTAURANT SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.dayHoursSchema = zod_1.z.object({
    open: zod_1.z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)'),
    close: zod_1.z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)'),
    closed: zod_1.z.boolean(),
});
exports.operatingHoursSchema = zod_1.z.object({
    mon: exports.dayHoursSchema,
    tue: exports.dayHoursSchema,
    wed: exports.dayHoursSchema,
    thu: exports.dayHoursSchema,
    fri: exports.dayHoursSchema,
    sat: exports.dayHoursSchema,
    sun: exports.dayHoursSchema,
});
exports.updateRestaurantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    description: zod_1.z.string().min(10).max(2000).optional(),
    story: zod_1.z.string().max(5000).optional(),
    phone: exports.kenyaPhoneSchema.optional(),
    email: exports.emailSchema.optional(),
    website: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    instagramHandle: zod_1.z.string().max(50).optional(),
    facebookUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    minimumOrder: zod_1.z.number().min(0).optional(),
    deliveryFeeBase: zod_1.z.number().min(0).optional(),
    deliveryFeePerKm: zod_1.z.number().min(0).optional(),
    deliveryRadiusKm: zod_1.z.number().min(1).max(50).optional(),
    avgPrepTimeMinutes: zod_1.z.number().int().min(5).max(120).optional(),
    isHalalCertified: zod_1.z.boolean().optional(),
    isVegetarianFriendly: zod_1.z.boolean().optional(),
    isVeganFriendly: zod_1.z.boolean().optional(),
    operatingHours: exports.operatingHoursSchema.optional(),
    payoutMethod: zod_1.z.enum(['MPESA', 'BANK']).optional(),
    payoutPhone: exports.kenyaPhoneSchema.optional(),
    payoutBankName: zod_1.z.string().max(100).optional(),
    payoutAccountNumber: zod_1.z.string().max(50).optional(),
    payoutAccountName: zod_1.z.string().max(100).optional(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIDER SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.updateRiderLocationSchema = zod_1.z.object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    heading: zod_1.z.number().min(0).max(360).optional(),
    speed: zod_1.z.number().min(0).optional(),
    accuracy: zod_1.z.number().min(0).optional(),
});
exports.updateRiderStatusSchema = zod_1.z.object({
    isOnline: zod_1.z.boolean(),
    latitude: zod_1.z.number().min(-90).max(90).optional(),
    longitude: zod_1.z.number().min(-180).max(180).optional(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPPORT SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.createSupportTicketSchema = zod_1.z.object({
    orderId: exports.uuidSchema.optional(),
    category: zod_1.z.enum([
        'ORDER_ISSUE',
        'PAYMENT_ISSUE',
        'DELIVERY_ISSUE',
        'RESTAURANT_ISSUE',
        'ACCOUNT_ISSUE',
        'REFUND_REQUEST',
        'GENERAL_INQUIRY',
        'OTHER',
    ]),
    subject: zod_1.z.string().min(5).max(200).trim(),
    message: zod_1.z.string().min(10).max(5000).trim(),
});
exports.createTicketMessageSchema = zod_1.z.object({
    message: zod_1.z.string().min(1).max(5000).trim(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROMO SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.validatePromoSchema = zod_1.z.object({
    code: zod_1.z.string().min(1).max(50).toUpperCase(),
    restaurantId: exports.uuidSchema,
    orderSubtotal: zod_1.z.number().min(0),
});
exports.createPromoSchema = zod_1.z.object({
    code: zod_1.z
        .string()
        .min(3)
        .max(20)
        .toUpperCase()
        .regex(/^[A-Z0-9]+$/, 'Code must be alphanumeric'),
    description: zod_1.z.string().max(500).optional(),
    customerDescription: zod_1.z.string().max(200).optional(),
    type: zod_1.z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_DELIVERY', 'FIRST_ORDER']),
    discountValue: zod_1.z.number().min(0),
    maxDiscountAmount: zod_1.z.number().min(0).optional(),
    minimumOrderAmount: zod_1.z.number().min(0).default(0),
    newUsersOnly: zod_1.z.boolean().default(false),
    firstOrderOnly: zod_1.z.boolean().default(false),
    usageLimit: zod_1.z.number().int().min(1).optional(),
    usageLimitPerUser: zod_1.z.number().int().min(1).default(1),
    validFrom: zod_1.z.string().datetime(),
    validTo: zod_1.z.string().datetime().optional(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COLLECTION SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.createCollectionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).trim(),
    description: zod_1.z.string().max(500).optional(),
    emoji: zod_1.z.string().max(10).optional(),
    isPublic: zod_1.z.boolean().default(false),
});
exports.addCollectionItemSchema = zod_1.z.object({
    menuItemId: exports.uuidSchema,
    note: zod_1.z.string().max(200).optional(),
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN SCHEMAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.approveRestaurantSchema = zod_1.z.object({
    commissionPercent: zod_1.z.number().min(0).max(50).default(18),
    notes: zod_1.z.string().max(500).optional(),
});
exports.rejectRestaurantSchema = zod_1.z.object({
    reason: zod_1.z.string().min(10).max(1000),
});
exports.suspendRestaurantSchema = zod_1.z.object({
    reason: zod_1.z.string().min(10).max(1000),
    suspendedUntil: zod_1.z.string().datetime().optional(),
});
exports.updateCommissionSchema = zod_1.z.object({
    commissionPercent: zod_1.z.number().min(0).max(50),
    reason: zod_1.z.string().max(500).optional(),
});
exports.broadcastNotificationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100),
    body: zod_1.z.string().min(1).max(500),
    target: zod_1.z.string().min(1),
    data: zod_1.z.record(zod_1.z.string()).optional(),
    scheduleFor: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=index.js.map
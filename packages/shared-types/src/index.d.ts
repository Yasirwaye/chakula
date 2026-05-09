export type UserRole = 'CUSTOMER' | 'RIDER' | 'RESTAURANT' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
export type AuthProvider = 'PHONE' | 'GOOGLE' | 'APPLE';
export interface User {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    avatar: string | null;
    role: UserRole;
    status: UserStatus;
    authProvider: AuthProvider;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    pushToken: string | null;
    pushEnabled: boolean;
    preferredLanguage: string;
    preferredCurrency: string;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AuthResponse {
    isNewUser: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    setupToken?: string;
    user?: User;
    phone?: string;
}
export type AddressType = 'HOME' | 'WORK' | 'OTHER';
export interface Address {
    id: string;
    userId: string;
    type: AddressType;
    label: string | null;
    formattedAddress: string;
    street: string | null;
    apartment: string | null;
    area: string | null;
    city: string;
    county: string | null;
    country: string;
    postalCode: string | null;
    latitude: number;
    longitude: number;
    instructions: string | null;
    landmark: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}
export type RestaurantStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'CLOSED';
export type CuisineType = 'LOCAL_KENYAN' | 'AFRICAN' | 'INDIAN' | 'CHINESE' | 'ITALIAN' | 'AMERICAN' | 'MEXICAN' | 'JAPANESE' | 'THAI' | 'ARABIC' | 'CONTINENTAL' | 'FAST_FOOD' | 'HEALTHY' | 'VEGETARIAN' | 'SEAFOOD' | 'GRILLS_BBQ' | 'BAKERY_PASTRY' | 'PIZZA' | 'BURGERS' | 'DESSERTS' | 'BEVERAGES' | 'OTHER';
export type MoodTag = 'COMFORT_FOOD' | 'QUICK_BITE' | 'DATE_NIGHT' | 'HEALTHY' | 'ADVENTUROUS' | 'BUDGET_FRIENDLY' | 'CELEBRATION' | 'POST_WORKOUT' | 'SPICY' | 'SHARING' | 'LATE_NIGHT' | 'BREAKFAST';
export interface OperatingHours {
    mon: DayHours;
    tue: DayHours;
    wed: DayHours;
    thu: DayHours;
    fri: DayHours;
    sat: DayHours;
    sun: DayHours;
}
export interface DayHours {
    open: string;
    close: string;
    closed: boolean;
}
export interface RestaurantCard {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    coverImage: string | null;
    cuisineTypes: CuisineType[];
    tags: string[];
    area: string | null;
    city: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
    avgRating: number;
    totalReviews: number;
    avgPrepTimeMinutes: number;
    estimatedDeliveryMinutes: number;
    deliveryFeeBase: number;
    deliveryFee: number;
    minimumOrder: number;
    isActive: boolean;
    isOpen: boolean;
    closesAt: string | null;
    opensAt: string | null;
    isHalalCertified: boolean;
    isVegetarianFriendly: boolean;
    isFeatured: boolean;
    isNew: boolean;
    hasActivePromo: boolean;
    isFavorited: boolean;
}
export interface RestaurantDetail extends RestaurantCard {
    description: string;
    story: string | null;
    images: string[];
    phone: string;
    email: string | null;
    website: string | null;
    instagramHandle: string | null;
    formattedAddress: string;
    isVeganFriendly: boolean;
    deliveryRadiusKm: number;
    operatingHours: OperatingHours;
    totalOrders: number;
    ratingBreakdown: {
        '5': number;
        '4': number;
        '3': number;
        '2': number;
        '1': number;
    };
}
export type CustomizationType = 'RADIO' | 'CHECKBOX';
export interface CustomizationOption {
    id: string;
    name: string;
    priceModifier: number;
}
export interface CustomizationGroup {
    id: string;
    name: string;
    type: CustomizationType;
    required: boolean;
    options: CustomizationOption[];
}
export interface ChosenCustomization {
    groupId: string;
    groupName: string;
    type: CustomizationType;
    chosen: Array<{
        optionId: string;
        optionName: string;
        priceModifier: number;
    }>;
}
export interface MenuItem {
    id: string;
    restaurantId: string;
    categoryId: string;
    name: string;
    description: string;
    basePrice: number;
    images: string[];
    isSpicy: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isChefsPick: boolean;
    isPopular: boolean;
    isNew: boolean;
    isAvailable: boolean;
    prepTimeMinutes: number | null;
    calories: number | null;
    proteinGrams: number | null;
    carbsGrams: number | null;
    fatGrams: number | null;
    allergens: string[];
    moodTags: MoodTag[];
    customizationGroups: CustomizationGroup[];
    avgRating: number;
    totalOrders: number;
    sortOrder: number;
}
export interface MenuCategory {
    id: string;
    restaurantId: string;
    name: string;
    description: string | null;
    image: string | null;
    sortOrder: number;
    isVisible: boolean;
    items: MenuItem[];
}
export type OrderStatus = 'PENDING' | 'PAYMENT_PENDING' | 'CONFIRMED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'ASSIGNED' | 'PICKED_UP' | 'ON_THE_WAY' | 'ARRIVING' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' | 'FAILED';
export type PaymentMethod = 'MPESA' | 'AIRTEL_MONEY' | 'CARD' | 'CASH' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'EXPIRED';
export type CancellationBy = 'CUSTOMER' | 'RESTAURANT' | 'RIDER' | 'SYSTEM' | 'ADMIN';
export interface OrderPricing {
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
}
export interface CartItem {
    menuItemId: string;
    itemName: string;
    itemImage: string | null;
    basePrice: number;
    quantity: number;
    chosenCustomizations: ChosenCustomization[];
    unitPrice: number;
    totalPrice: number;
    specialNote: string | null;
}
export interface OrderItem extends CartItem {
    id: string;
    orderId: string;
    itemDescription: string | null;
}
export interface RiderInfo {
    id: string;
    name: string;
    avatar: string | null;
    phone: string;
    vehicleType: string;
    vehiclePlate: string | null;
    avgRating: number;
    totalDeliveries: number;
    currentLatitude: number | null;
    currentLongitude: number | null;
    distanceFromCustomerKm: number | null;
    estimatedArrivalMinutes: number | null;
}
export interface OrderStatusHistoryItem {
    status: OrderStatus;
    timestamp: string;
    note: string | null;
}
export interface Order {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    restaurant: {
        id: string;
        name: string;
        logo: string | null;
        phone: string;
        formattedAddress: string;
        latitude: number;
        longitude: number;
    };
    rider: RiderInfo | null;
    items: OrderItem[];
    deliveryAddress: {
        formattedAddress: string;
        apartment: string | null;
        instructions: string | null;
        landmark: string | null;
        latitude: number;
        longitude: number;
    };
    pricing: OrderPricing;
    promoCode: string | null;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    specialInstructions: string | null;
    cutleryIncluded: boolean;
    statusHistory: OrderStatusHistoryItem[];
    customerRated: boolean;
    cancellable: boolean;
    estimatedDeliveryAt: string | null;
    deliveredAt: string | null;
    createdAt: string;
}
export interface PaymentInstruction {
    type: 'MPESA_STK' | 'AIRTEL_USSD' | 'FLUTTERWAVE' | 'CASH';
    message: string;
    checkoutRequestId?: string;
    checkoutUrl?: string;
}
export interface PaymentStatusResponse {
    orderId: string;
    orderNumber: string;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    amount: number;
    currency: string;
    transactionId: string | null;
    failureReason: string | null;
    orderStatus: OrderStatus;
}
export type NotificationType = 'ORDER_CONFIRMED' | 'ORDER_ACCEPTED' | 'ORDER_PREPARING' | 'ORDER_READY' | 'ORDER_PICKED_UP' | 'ORDER_ON_THE_WAY' | 'ORDER_ARRIVING' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED' | 'ORDER_REFUNDED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'NEW_ORDER' | 'DELIVERY_REQUEST' | 'DELIVERY_ASSIGNED' | 'PROMO_AVAILABLE' | 'REVIEW_REMINDER' | 'SYSTEM_ANNOUNCEMENT' | 'SUPPORT_REPLY';
export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, string> | null;
    imageUrl: string | null;
    isRead: boolean;
    readAt: string | null;
    orderId: string | null;
    createdAt: string;
}
export type RiderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'OFFLINE';
export type VehicleType = 'BICYCLE' | 'MOTORCYCLE' | 'CAR' | 'TUKTUK' | 'FOOT';
export interface Rider {
    id: string;
    userId: string;
    status: RiderStatus;
    vehicleType: VehicleType;
    vehicleMake: string | null;
    vehicleModel: string | null;
    vehicleYear: number | null;
    vehicleColor: string | null;
    vehiclePlate: string | null;
    currentLatitude: number | null;
    currentLongitude: number | null;
    isOnline: boolean;
    isAvailable: boolean;
    avgRating: number;
    totalRatings: number;
    totalDeliveries: number;
    completionRate: number;
    acceptanceRate: number;
    totalEarnings: number;
    pendingEarnings: number;
    createdAt: string;
}
export interface RiderEarning {
    id: string;
    riderId: string;
    orderId: string | null;
    type: 'DELIVERY_FEE' | 'BONUS' | 'TIP' | 'ADJUSTMENT';
    amount: number;
    description: string | null;
    isPaidOut: boolean;
    createdAt: string;
}
export interface Review {
    id: string;
    customerId: string;
    customer: {
        id: string;
        name: string;
        avatar: string | null;
    };
    orderId: string;
    restaurantId: string | null;
    riderId: string | null;
    overallRating: number;
    foodRating: number | null;
    deliveryRating: number | null;
    comment: string | null;
    photos: string[];
    restaurantTags: string[];
    riderTags: string[];
    restaurantResponse: string | null;
    restaurantRespondedAt: string | null;
    createdAt: string;
}
export type PromoType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY' | 'FIRST_ORDER';
export interface PromoValidation {
    isValid: boolean;
    code: string;
    description: string;
    discountType: PromoType;
    discountValue: number;
    discountAmount: number;
    maxDiscount: number | null;
    minimumOrder: number;
    expiresAt: string | null;
}
export interface ApiResponse<T = null> {
    success: boolean;
    message: string;
    data: T;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}
export interface ApiError {
    success: false;
    message: string;
    error: {
        code: string;
        details?: Array<{
            field: string;
            message: string;
        }>;
    };
}
export interface SocketOrderStatusChanged {
    orderId: string;
    orderNumber: string;
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
    message: string;
    timestamp: string;
}
export interface SocketRiderLocation {
    orderId: string;
    riderId: string;
    latitude: number;
    longitude: number;
    heading: number | null;
    speed: number | null;
    distanceFromCustomerKm: number | null;
    estimatedArrivalMinutes: number | null;
    timestamp: string;
}
export interface SocketRiderAssigned {
    orderId: string;
    rider: RiderInfo;
}
export interface SocketChatMessage {
    orderId: string;
    messageId: string;
    senderId: string;
    senderRole: UserRole;
    senderName: string;
    message: string;
    timestamp: string;
}
export interface SocketNewOrder {
    orderId: string;
    orderNumber: string;
    items: Array<{
        name: string;
        customizations: string;
        quantity: number;
    }>;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    customerName: string;
    deliveryArea: string;
    specialInstructions: string | null;
    mustAcceptBy: string;
    estimatedDeliveryAt: string;
}
export interface SocketDeliveryRequest {
    orderId: string;
    restaurantName: string;
    restaurantAddress: string;
    restaurantLatitude: number;
    restaurantLongitude: number;
    customerArea: string;
    distanceKm: number;
    estimatedMinutes: number;
    yourEarnings: number;
    expiresAt: string;
    isCashOrder: boolean;
}
export interface PublicAppConfig {
    maintenanceMode: boolean;
    maintenanceMessage: string | null;
    minAppVersionIos: string;
    minAppVersionAndroid: string;
    serviceFee: number;
    baseDeliveryFee: number;
    deliveryFeePerKm: number;
    supportPhone: string;
    supportEmail: string;
    currency: string;
    defaultRadiusKm: number;
}
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'ORDER_ISSUE' | 'PAYMENT_ISSUE' | 'DELIVERY_ISSUE' | 'RESTAURANT_ISSUE' | 'ACCOUNT_ISSUE' | 'REFUND_REQUEST' | 'GENERAL_INQUIRY' | 'OTHER';
export interface SupportTicket {
    id: string;
    ticketNumber: string;
    userId: string;
    orderId: string | null;
    category: TicketCategory;
    subject: string;
    status: TicketStatus;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface TicketMessage {
    id: string;
    ticketId: string;
    senderId: string;
    senderRole: UserRole;
    message: string;
    attachments: string[];
    isInternal: boolean;
    readAt: string | null;
    createdAt: string;
}
export interface FoodCollection {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    emoji: string | null;
    coverImage: string | null;
    isPublic: boolean;
    shareToken: string | null;
    itemCount: number;
    createdAt: string;
    updatedAt: string;
}
export interface CollectionItem {
    id: string;
    collectionId: string;
    menuItem: MenuItem & {
        restaurant: Pick<RestaurantCard, 'id' | 'name' | 'logo'>;
    };
    note: string | null;
    sortOrder: number;
    createdAt: string;
}
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'ON_HOLD';
export type PayoutType = 'RESTAURANT' | 'RIDER';
export interface Payout {
    id: string;
    payoutReference: string;
    type: PayoutType;
    status: PayoutStatus;
    restaurantId: string | null;
    riderId: string | null;
    grossAmount: number;
    deductions: number;
    netAmount: number;
    currency: string;
    periodFrom: string;
    periodTo: string;
    orderCount: number;
    payoutMethod: string;
    transactionId: string | null;
    processedAt: string | null;
    createdAt: string;
}
export interface AppBanner {
    id: string;
    title: string;
    subtitle: string | null;
    imageUrl: string;
    actionType: 'RESTAURANT' | 'PROMO' | 'EXTERNAL_URL' | 'NONE';
    actionValue: string | null;
    isActive: boolean;
    sortOrder: number;
}
//# sourceMappingURL=index.d.ts.map
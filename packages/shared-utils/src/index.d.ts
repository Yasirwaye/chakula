import type { OperatingHours } from '@chakula/shared-types';
export declare const formatCurrency: (amount: number, currency?: string, locale?: string) => string;
export declare const formatAmount: (amount: number) => string;
export declare const normalizePhone: (phone: string) => string;
export declare const maskPhone: (phone: string) => string;
export declare const maskEmail: (email: string) => string;
export declare const formatPhoneForDaraja: (phone: string) => string;
export declare const calculateDistanceKm: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
export declare const formatDistance: (km: number) => string;
export declare const calculateDeliveryFee: (distanceKm: number, baseFeeFee?: number, feePerKm?: number, freeAboveDistance?: number) => number;
export declare const calculateEstimatedDeliveryMinutes: (prepTimeMinutes: number, distanceKm: number, avgSpeedKmh?: number) => number;
export declare const isRestaurantOpen: (operatingHours: OperatingHours, isActiveToggle: boolean) => boolean;
export declare const getClosingTime: (operatingHours: OperatingHours) => string | null;
export declare const calculateCommission: (subtotal: number, commissionPercent: number) => {
    restaurantEarnings: number;
    platformCommission: number;
};
export declare const calculateRiderEarnings: (distanceKm: number, baseEarning?: number, earningsPerKm?: number) => number;
export declare const formatDate: (date: string | Date) => string;
export declare const formatDateTime: (date: string | Date) => string;
export declare const formatTime: (date: string | Date) => string;
export declare const timeAgo: (date: string | Date) => string;
export declare const slugify: (text: string) => string;
export declare const truncate: (text: string, maxLength: number) => string;
export declare const capitalize: (text: string) => string;
export declare const generateOTP: (length?: number) => string;
export declare const isOrderCancellable: (status: string) => boolean;
export declare const isOrderActive: (status: string) => boolean;
export declare const getOrderStatusMessage: (status: string, restaurantName?: string) => string;
export declare const getPaginationMeta: (total: number, page: number, limit: number) => {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};
export declare const getPaginationOffset: (page: number, limit: number) => number;
//# sourceMappingURL=index.d.ts.map
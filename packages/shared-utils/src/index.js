"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationOffset = exports.getPaginationMeta = exports.getOrderStatusMessage = exports.isOrderActive = exports.isOrderCancellable = exports.generateOTP = exports.capitalize = exports.truncate = exports.slugify = exports.timeAgo = exports.formatTime = exports.formatDateTime = exports.formatDate = exports.calculateRiderEarnings = exports.calculateCommission = exports.getClosingTime = exports.isRestaurantOpen = exports.calculateEstimatedDeliveryMinutes = exports.calculateDeliveryFee = exports.formatDistance = exports.calculateDistanceKm = exports.formatPhoneForDaraja = exports.maskEmail = exports.maskPhone = exports.normalizePhone = exports.formatAmount = exports.formatCurrency = void 0;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CURRENCY FORMATTING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const formatCurrency = (amount, currency = 'KES', locale = 'en-KE') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const formatAmount = (amount) => {
    return `KES ${amount.toLocaleString('en-KE')}`;
};
exports.formatAmount = formatAmount;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHONE FORMATTING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const normalizePhone = (phone) => {
    const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (cleaned.startsWith('0')) {
        return '+254' + cleaned.slice(1);
    }
    if (cleaned.startsWith('254') && !cleaned.startsWith('+')) {
        return '+' + cleaned;
    }
    return cleaned;
};
exports.normalizePhone = normalizePhone;
const maskPhone = (phone) => {
    if (phone.length < 8)
        return phone;
    const start = phone.slice(0, 5);
    const end = phone.slice(-3);
    const masked = '*'.repeat(phone.length - 8);
    return `${start}${masked}${end}`;
};
exports.maskPhone = maskPhone;
const maskEmail = (email) => {
    const [user, domain] = email.split('@');
    if (!user || !domain)
        return email;
    const maskedUser = user.length <= 2
        ? user
        : user[0] + '*'.repeat(user.length - 2) + user[user.length - 1];
    return `${maskedUser}@${domain}`;
};
exports.maskEmail = maskEmail;
// Format phone for Daraja (M-Pesa) — removes + prefix
const formatPhoneForDaraja = (phone) => {
    const normalized = (0, exports.normalizePhone)(phone);
    return normalized.replace('+', '');
};
exports.formatPhoneForDaraja = formatPhoneForDaraja;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DISTANCE CALCULATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
};
exports.calculateDistanceKm = calculateDistanceKm;
const toRad = (value) => (value * Math.PI) / 180;
const formatDistance = (km) => {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
};
exports.formatDistance = formatDistance;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELIVERY FEE CALCULATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const calculateDeliveryFee = (distanceKm, baseFeeFee = 80, feePerKm = 20, freeAboveDistance = 2 // First 2km included in base fee
) => {
    if (distanceKm <= freeAboveDistance) {
        return baseFeeFee;
    }
    const extraKm = distanceKm - freeAboveDistance;
    const extraFee = Math.round(extraKm * feePerKm);
    return baseFeeFee + extraFee;
};
exports.calculateDeliveryFee = calculateDeliveryFee;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ESTIMATED DELIVERY TIME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const calculateEstimatedDeliveryMinutes = (prepTimeMinutes, distanceKm, avgSpeedKmh = 25 // Average rider speed in city
) => {
    const travelTimeMinutes = Math.ceil((distanceKm / avgSpeedKmh) * 60);
    const buffer = 5; // Buffer for pickup + handoff
    return prepTimeMinutes + travelTimeMinutes + buffer;
};
exports.calculateEstimatedDeliveryMinutes = calculateEstimatedDeliveryMinutes;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OPERATING HOURS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const isRestaurantOpen = (operatingHours, isActiveToggle) => {
    if (!isActiveToggle)
        return false;
    const now = new Date();
    // Use EAT (UTC+3)
    const eatOffset = 3 * 60;
    const eatTime = new Date(now.getTime() + eatOffset * 60 * 1000);
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayKey = days[eatTime.getUTCDay()];
    const todayHours = operatingHours[dayKey];
    if (todayHours.closed)
        return false;
    const currentMinutes = eatTime.getUTCHours() * 60 + eatTime.getUTCMinutes();
    const [openH, openM] = todayHours.open.split(':').map(Number);
    const [closeH, closeM] = todayHours.close.split(':').map(Number);
    const openMinutes = (openH ?? 0) * 60 + (openM ?? 0);
    const closeMinutes = (closeH ?? 0) * 60 + (closeM ?? 0);
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};
exports.isRestaurantOpen = isRestaurantOpen;
const getClosingTime = (operatingHours) => {
    const now = new Date();
    const eatOffset = 3 * 60;
    const eatTime = new Date(now.getTime() + eatOffset * 60 * 1000);
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayKey = days[eatTime.getUTCDay()];
    const todayHours = operatingHours[dayKey];
    if (todayHours.closed)
        return null;
    return todayHours.close;
};
exports.getClosingTime = getClosingTime;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMMISSION CALCULATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const calculateCommission = (subtotal, commissionPercent) => {
    const platformCommission = Math.round(subtotal * (commissionPercent / 100));
    const restaurantEarnings = subtotal - platformCommission;
    return { restaurantEarnings, platformCommission };
};
exports.calculateCommission = calculateCommission;
const calculateRiderEarnings = (distanceKm, baseEarning = 80, earningsPerKm = 25) => {
    const distanceEarning = Math.round(distanceKm * earningsPerKm);
    return baseEarning + distanceEarning;
};
exports.calculateRiderEarnings = calculateRiderEarnings;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATE FORMATTING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Africa/Nairobi',
    });
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Nairobi',
    });
};
exports.formatDateTime = formatDateTime;
const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-KE', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Nairobi',
    });
};
exports.formatTime = formatTime;
const timeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMinutes < 1)
        return 'Just now';
    if (diffMinutes < 60)
        return `${diffMinutes} min ago`;
    if (diffHours < 24)
        return `${diffHours}h ago`;
    if (diffDays === 1)
        return 'Yesterday';
    if (diffDays < 7)
        return `${diffDays} days ago`;
    return (0, exports.formatDate)(date);
};
exports.timeAgo = timeAgo;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STRING UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.slugify = slugify;
const truncate = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength - 3) + '...';
};
exports.truncate = truncate;
const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
exports.capitalize = capitalize;
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
};
exports.generateOTP = generateOTP;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORDER UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const isOrderCancellable = (status) => {
    return ['PENDING', 'PAYMENT_PENDING', 'CONFIRMED'].includes(status);
};
exports.isOrderCancellable = isOrderCancellable;
const isOrderActive = (status) => {
    return [
        'CONFIRMED',
        'ACCEPTED',
        'PREPARING',
        'READY',
        'ASSIGNED',
        'PICKED_UP',
        'ON_THE_WAY',
        'ARRIVING',
    ].includes(status);
};
exports.isOrderActive = isOrderActive;
const getOrderStatusMessage = (status, restaurantName) => {
    const name = restaurantName ?? 'the restaurant';
    const messages = {
        CONFIRMED: `${name} just got your order! 🧑‍🍳`,
        ACCEPTED: `${name} accepted your order! Preparing now 🍳`,
        PREPARING: `Your food is being lovingly prepared 🍳`,
        READY: `Your food is ready! Waiting for a rider 🏍️`,
        ASSIGNED: `A rider has been assigned to your order! 🏍️`,
        PICKED_UP: `Rider has collected your food! On the way 🏍️`,
        ON_THE_WAY: `Your rider is heading to you! Almost there 🏍️`,
        ARRIVING: `Almost there! You can almost smell it 👃`,
        DELIVERED: `Enjoy your meal! 🎉`,
        CANCELLED: `Your order has been cancelled`,
    };
    return messages[status] ?? `Order status: ${status}`;
};
exports.getOrderStatusMessage = getOrderStatusMessage;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGINATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};
exports.getPaginationMeta = getPaginationMeta;
const getPaginationOffset = (page, limit) => {
    return (page - 1) * limit;
};
exports.getPaginationOffset = getPaginationOffset;
//# sourceMappingURL=index.js.map
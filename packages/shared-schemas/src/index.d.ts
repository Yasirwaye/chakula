import { z } from 'zod';
export declare const uuidSchema: z.ZodString;
export declare const phoneSchema: z.ZodString;
export declare const kenyaPhoneSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const emailSchema: z.ZodString;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const coordinatesSchema: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lng: number;
}, {
    lat: number;
    lng: number;
}>;
export declare const sendOtpSchema: z.ZodObject<{
    phone: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    phone: string;
}, {
    phone: string;
}>;
export declare const verifyOtpSchema: z.ZodObject<{
    phone: z.ZodEffects<z.ZodString, string, string>;
    otp: z.ZodString;
    deviceId: z.ZodOptional<z.ZodString>;
    deviceName: z.ZodOptional<z.ZodString>;
    deviceOS: z.ZodOptional<z.ZodString>;
    pushToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    otp: string;
    deviceId?: string | undefined;
    deviceName?: string | undefined;
    deviceOS?: string | undefined;
    pushToken?: string | undefined;
}, {
    phone: string;
    otp: string;
    deviceId?: string | undefined;
    deviceName?: string | undefined;
    deviceOS?: string | undefined;
    pushToken?: string | undefined;
}>;
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    deviceId: z.ZodOptional<z.ZodString>;
    deviceName: z.ZodOptional<z.ZodString>;
    deviceOS: z.ZodOptional<z.ZodString>;
    pushToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    deviceId?: string | undefined;
    deviceName?: string | undefined;
    deviceOS?: string | undefined;
    pushToken?: string | undefined;
}, {
    name: string;
    email: string;
    deviceId?: string | undefined;
    deviceName?: string | undefined;
    deviceOS?: string | undefined;
    pushToken?: string | undefined;
}>;
export declare const googleAuthSchema: z.ZodObject<{
    idToken: z.ZodString;
    deviceId: z.ZodOptional<z.ZodString>;
    pushToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    idToken: string;
    deviceId?: string | undefined;
    pushToken?: string | undefined;
}, {
    idToken: string;
    deviceId?: string | undefined;
    pushToken?: string | undefined;
}>;
export declare const appleAuthSchema: z.ZodObject<{
    identityToken: z.ZodString;
    authorizationCode: z.ZodString;
    fullName: z.ZodOptional<z.ZodObject<{
        givenName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        familyName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        givenName?: string | null | undefined;
        familyName?: string | null | undefined;
    }, {
        givenName?: string | null | undefined;
        familyName?: string | null | undefined;
    }>>;
    email: z.ZodOptional<z.ZodString>;
    deviceId: z.ZodOptional<z.ZodString>;
    pushToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    identityToken: string;
    authorizationCode: string;
    deviceId?: string | undefined;
    pushToken?: string | undefined;
    email?: string | undefined;
    fullName?: {
        givenName?: string | null | undefined;
        familyName?: string | null | undefined;
    } | undefined;
}, {
    identityToken: string;
    authorizationCode: string;
    deviceId?: string | undefined;
    pushToken?: string | undefined;
    email?: string | undefined;
    fullName?: {
        givenName?: string | null | undefined;
        familyName?: string | null | undefined;
    } | undefined;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const logoutSchema: z.ZodObject<{
    refreshToken: z.ZodString;
    logoutAll: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
    logoutAll: boolean;
}, {
    refreshToken: string;
    logoutAll?: boolean | undefined;
}>;
export declare const restaurantLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const restaurantRegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    phone: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    name: string;
    email: string;
    password: string;
}, {
    phone: string;
    name: string;
    email: string;
    password: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    preferredLanguage: z.ZodOptional<z.ZodEnum<["en", "sw"]>>;
    pushEnabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    preferredLanguage?: "en" | "sw" | undefined;
    pushEnabled?: boolean | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    preferredLanguage?: "en" | "sw" | undefined;
    pushEnabled?: boolean | undefined;
}>;
export declare const updatePushTokenSchema: z.ZodObject<{
    pushToken: z.ZodString;
    deviceId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    deviceId: string;
    pushToken: string;
}, {
    deviceId: string;
    pushToken: string;
}>;
export declare const createAddressSchema: z.ZodObject<{
    type: z.ZodEnum<["HOME", "WORK", "OTHER"]>;
    label: z.ZodOptional<z.ZodString>;
    formattedAddress: z.ZodString;
    apartment: z.ZodOptional<z.ZodString>;
    area: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    county: z.ZodOptional<z.ZodString>;
    country: z.ZodDefault<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    instructions: z.ZodOptional<z.ZodString>;
    landmark: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "HOME" | "WORK" | "OTHER";
    formattedAddress: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
    label?: string | undefined;
    apartment?: string | undefined;
    area?: string | undefined;
    county?: string | undefined;
    postalCode?: string | undefined;
    instructions?: string | undefined;
    landmark?: string | undefined;
}, {
    type: "HOME" | "WORK" | "OTHER";
    formattedAddress: string;
    city: string;
    latitude: number;
    longitude: number;
    label?: string | undefined;
    apartment?: string | undefined;
    area?: string | undefined;
    county?: string | undefined;
    country?: string | undefined;
    postalCode?: string | undefined;
    instructions?: string | undefined;
    landmark?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const updateAddressSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["HOME", "WORK", "OTHER"]>>;
    label: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    formattedAddress: z.ZodOptional<z.ZodString>;
    apartment: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    area: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodString>;
    county: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    country: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    postalCode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    instructions: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    landmark: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isDefault: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    type?: "HOME" | "WORK" | "OTHER" | undefined;
    label?: string | undefined;
    formattedAddress?: string | undefined;
    apartment?: string | undefined;
    area?: string | undefined;
    city?: string | undefined;
    county?: string | undefined;
    country?: string | undefined;
    postalCode?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    instructions?: string | undefined;
    landmark?: string | undefined;
    isDefault?: boolean | undefined;
}, {
    type?: "HOME" | "WORK" | "OTHER" | undefined;
    label?: string | undefined;
    formattedAddress?: string | undefined;
    apartment?: string | undefined;
    area?: string | undefined;
    city?: string | undefined;
    county?: string | undefined;
    country?: string | undefined;
    postalCode?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    instructions?: string | undefined;
    landmark?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const chosenCustomizationSchema: z.ZodObject<{
    groupId: z.ZodString;
    chosen: z.ZodArray<z.ZodObject<{
        optionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        optionId: string;
    }, {
        optionId: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    groupId: string;
    chosen: {
        optionId: string;
    }[];
}, {
    groupId: string;
    chosen: {
        optionId: string;
    }[];
}>;
export declare const orderItemSchema: z.ZodObject<{
    menuItemId: z.ZodString;
    quantity: z.ZodNumber;
    chosenCustomizations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        groupId: z.ZodString;
        chosen: z.ZodArray<z.ZodObject<{
            optionId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            optionId: string;
        }, {
            optionId: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        groupId: string;
        chosen: {
            optionId: string;
        }[];
    }, {
        groupId: string;
        chosen: {
            optionId: string;
        }[];
    }>, "many">>;
    specialNote: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    menuItemId: string;
    quantity: number;
    chosenCustomizations: {
        groupId: string;
        chosen: {
            optionId: string;
        }[];
    }[];
    specialNote?: string | undefined;
}, {
    menuItemId: string;
    quantity: number;
    chosenCustomizations?: {
        groupId: string;
        chosen: {
            optionId: string;
        }[];
    }[] | undefined;
    specialNote?: string | undefined;
}>;
export declare const createOrderSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    restaurantId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        menuItemId: z.ZodString;
        quantity: z.ZodNumber;
        chosenCustomizations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            groupId: z.ZodString;
            chosen: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                optionId: string;
            }, {
                optionId: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }, {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }>, "many">>;
        specialNote: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        menuItemId: string;
        quantity: number;
        chosenCustomizations: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[];
        specialNote?: string | undefined;
    }, {
        menuItemId: string;
        quantity: number;
        chosenCustomizations?: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[] | undefined;
        specialNote?: string | undefined;
    }>, "many">;
    deliveryAddressId: z.ZodString;
    deliveryType: z.ZodDefault<z.ZodEnum<["ASAP", "SCHEDULED"]>>;
    scheduledFor: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodEnum<["MPESA", "AIRTEL_MONEY", "CARD", "CASH"]>;
    mpesaPhone: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    airtelPhone: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    promoCode: z.ZodOptional<z.ZodString>;
    specialInstructions: z.ZodOptional<z.ZodString>;
    cutleryIncluded: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    restaurantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        chosenCustomizations: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[];
        specialNote?: string | undefined;
    }[];
    deliveryAddressId: string;
    deliveryType: "ASAP" | "SCHEDULED";
    paymentMethod: "MPESA" | "AIRTEL_MONEY" | "CARD" | "CASH";
    cutleryIncluded: boolean;
    scheduledFor?: string | undefined;
    mpesaPhone?: string | undefined;
    airtelPhone?: string | undefined;
    promoCode?: string | undefined;
    specialInstructions?: string | undefined;
}, {
    restaurantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        chosenCustomizations?: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[] | undefined;
        specialNote?: string | undefined;
    }[];
    deliveryAddressId: string;
    paymentMethod: "MPESA" | "AIRTEL_MONEY" | "CARD" | "CASH";
    deliveryType?: "ASAP" | "SCHEDULED" | undefined;
    scheduledFor?: string | undefined;
    mpesaPhone?: string | undefined;
    airtelPhone?: string | undefined;
    promoCode?: string | undefined;
    specialInstructions?: string | undefined;
    cutleryIncluded?: boolean | undefined;
}>, {
    restaurantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        chosenCustomizations: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[];
        specialNote?: string | undefined;
    }[];
    deliveryAddressId: string;
    deliveryType: "ASAP" | "SCHEDULED";
    paymentMethod: "MPESA" | "AIRTEL_MONEY" | "CARD" | "CASH";
    cutleryIncluded: boolean;
    scheduledFor?: string | undefined;
    mpesaPhone?: string | undefined;
    airtelPhone?: string | undefined;
    promoCode?: string | undefined;
    specialInstructions?: string | undefined;
}, {
    restaurantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        chosenCustomizations?: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[] | undefined;
        specialNote?: string | undefined;
    }[];
    deliveryAddressId: string;
    paymentMethod: "MPESA" | "AIRTEL_MONEY" | "CARD" | "CASH";
    deliveryType?: "ASAP" | "SCHEDULED" | undefined;
    scheduledFor?: string | undefined;
    mpesaPhone?: string | undefined;
    airtelPhone?: string | undefined;
    promoCode?: string | undefined;
    specialInstructions?: string | undefined;
    cutleryIncluded?: boolean | undefined;
}>, {
    restaurantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        chosenCustomizations: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[];
        specialNote?: string | undefined;
    }[];
    deliveryAddressId: string;
    deliveryType: "ASAP" | "SCHEDULED";
    paymentMethod: "MPESA" | "AIRTEL_MONEY" | "CARD" | "CASH";
    cutleryIncluded: boolean;
    scheduledFor?: string | undefined;
    mpesaPhone?: string | undefined;
    airtelPhone?: string | undefined;
    promoCode?: string | undefined;
    specialInstructions?: string | undefined;
}, {
    restaurantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        chosenCustomizations?: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[] | undefined;
        specialNote?: string | undefined;
    }[];
    deliveryAddressId: string;
    paymentMethod: "MPESA" | "AIRTEL_MONEY" | "CARD" | "CASH";
    deliveryType?: "ASAP" | "SCHEDULED" | undefined;
    scheduledFor?: string | undefined;
    mpesaPhone?: string | undefined;
    airtelPhone?: string | undefined;
    promoCode?: string | undefined;
    specialInstructions?: string | undefined;
    cutleryIncluded?: boolean | undefined;
}>, {
    restaurantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        chosenCustomizations: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[];
        specialNote?: string | undefined;
    }[];
    deliveryAddressId: string;
    deliveryType: "ASAP" | "SCHEDULED";
    paymentMethod: "MPESA" | "AIRTEL_MONEY" | "CARD" | "CASH";
    cutleryIncluded: boolean;
    scheduledFor?: string | undefined;
    mpesaPhone?: string | undefined;
    airtelPhone?: string | undefined;
    promoCode?: string | undefined;
    specialInstructions?: string | undefined;
}, {
    restaurantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        chosenCustomizations?: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[] | undefined;
        specialNote?: string | undefined;
    }[];
    deliveryAddressId: string;
    paymentMethod: "MPESA" | "AIRTEL_MONEY" | "CARD" | "CASH";
    deliveryType?: "ASAP" | "SCHEDULED" | undefined;
    scheduledFor?: string | undefined;
    mpesaPhone?: string | undefined;
    airtelPhone?: string | undefined;
    promoCode?: string | undefined;
    specialInstructions?: string | undefined;
    cutleryIncluded?: boolean | undefined;
}>;
export declare const cancelOrderSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
export declare const validateOrderSchema: z.ZodObject<{
    restaurantId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        menuItemId: z.ZodString;
        quantity: z.ZodNumber;
        chosenCustomizations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            groupId: z.ZodString;
            chosen: z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                optionId: string;
            }, {
                optionId: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }, {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }>, "many">>;
        specialNote: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        menuItemId: string;
        quantity: number;
        chosenCustomizations: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[];
        specialNote?: string | undefined;
    }, {
        menuItemId: string;
        quantity: number;
        chosenCustomizations?: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[] | undefined;
        specialNote?: string | undefined;
    }>, "many">;
    deliveryAddressId: z.ZodString;
    promoCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    restaurantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        chosenCustomizations: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[];
        specialNote?: string | undefined;
    }[];
    deliveryAddressId: string;
    promoCode?: string | undefined;
}, {
    restaurantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        chosenCustomizations?: {
            groupId: string;
            chosen: {
                optionId: string;
            }[];
        }[] | undefined;
        specialNote?: string | undefined;
    }[];
    deliveryAddressId: string;
    promoCode?: string | undefined;
}>;
export declare const createReviewSchema: z.ZodObject<{
    orderId: z.ZodString;
    restaurantId: z.ZodOptional<z.ZodString>;
    riderId: z.ZodOptional<z.ZodString>;
    overallRating: z.ZodNumber;
    foodRating: z.ZodOptional<z.ZodNumber>;
    packagingRating: z.ZodOptional<z.ZodNumber>;
    valueRating: z.ZodOptional<z.ZodNumber>;
    deliveryRating: z.ZodOptional<z.ZodNumber>;
    riderRating: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
    restaurantTags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    riderTags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    itemRatings: z.ZodOptional<z.ZodArray<z.ZodObject<{
        menuItemId: z.ZodString;
        rating: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        menuItemId: string;
        rating: number;
    }, {
        menuItemId: string;
        rating: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    overallRating: number;
    restaurantTags: string[];
    riderTags: string[];
    restaurantId?: string | undefined;
    riderId?: string | undefined;
    foodRating?: number | undefined;
    packagingRating?: number | undefined;
    valueRating?: number | undefined;
    deliveryRating?: number | undefined;
    riderRating?: number | undefined;
    comment?: string | undefined;
    itemRatings?: {
        menuItemId: string;
        rating: number;
    }[] | undefined;
}, {
    orderId: string;
    overallRating: number;
    restaurantId?: string | undefined;
    riderId?: string | undefined;
    foodRating?: number | undefined;
    packagingRating?: number | undefined;
    valueRating?: number | undefined;
    deliveryRating?: number | undefined;
    riderRating?: number | undefined;
    comment?: string | undefined;
    restaurantTags?: string[] | undefined;
    riderTags?: string[] | undefined;
    itemRatings?: {
        menuItemId: string;
        rating: number;
    }[] | undefined;
}>;
export declare const customizationOptionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    priceModifier: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    priceModifier: number;
}, {
    name: string;
    id: string;
    priceModifier: number;
}>;
export declare const customizationGroupSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["RADIO", "CHECKBOX"]>;
    required: z.ZodBoolean;
    options: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        priceModifier: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        priceModifier: number;
    }, {
        name: string;
        id: string;
        priceModifier: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    options: {
        name: string;
        id: string;
        priceModifier: number;
    }[];
    type: "RADIO" | "CHECKBOX";
    name: string;
    id: string;
    required: boolean;
}, {
    options: {
        name: string;
        id: string;
        priceModifier: number;
    }[];
    type: "RADIO" | "CHECKBOX";
    name: string;
    id: string;
    required: boolean;
}>;
export declare const createMenuItemSchema: z.ZodObject<{
    categoryId: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    basePrice: z.ZodNumber;
    prepTimeMinutes: z.ZodOptional<z.ZodNumber>;
    isSpicy: z.ZodDefault<z.ZodBoolean>;
    isVegetarian: z.ZodDefault<z.ZodBoolean>;
    isVegan: z.ZodDefault<z.ZodBoolean>;
    isGlutenFree: z.ZodDefault<z.ZodBoolean>;
    isChefsPick: z.ZodDefault<z.ZodBoolean>;
    isAvailable: z.ZodDefault<z.ZodBoolean>;
    moodTags: z.ZodDefault<z.ZodArray<z.ZodEnum<["COMFORT_FOOD", "QUICK_BITE", "DATE_NIGHT", "HEALTHY", "ADVENTUROUS", "BUDGET_FRIENDLY", "CELEBRATION", "POST_WORKOUT", "SPICY", "SHARING", "LATE_NIGHT", "BREAKFAST"]>, "many">>;
    calories: z.ZodOptional<z.ZodNumber>;
    allergens: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    customizationGroups: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        type: z.ZodEnum<["RADIO", "CHECKBOX"]>;
        required: z.ZodBoolean;
        options: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            priceModifier: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            priceModifier: number;
        }, {
            name: string;
            id: string;
            priceModifier: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        options: {
            name: string;
            id: string;
            priceModifier: number;
        }[];
        type: "RADIO" | "CHECKBOX";
        name: string;
        id: string;
        required: boolean;
    }, {
        options: {
            name: string;
            id: string;
            priceModifier: number;
        }[];
        type: "RADIO" | "CHECKBOX";
        name: string;
        id: string;
        required: boolean;
    }>, "many">>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    categoryId: string;
    description: string;
    basePrice: number;
    isSpicy: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isChefsPick: boolean;
    isAvailable: boolean;
    moodTags: ("COMFORT_FOOD" | "QUICK_BITE" | "DATE_NIGHT" | "HEALTHY" | "ADVENTUROUS" | "BUDGET_FRIENDLY" | "CELEBRATION" | "POST_WORKOUT" | "SPICY" | "SHARING" | "LATE_NIGHT" | "BREAKFAST")[];
    allergens: string[];
    customizationGroups: {
        options: {
            name: string;
            id: string;
            priceModifier: number;
        }[];
        type: "RADIO" | "CHECKBOX";
        name: string;
        id: string;
        required: boolean;
    }[];
    sortOrder: number;
    prepTimeMinutes?: number | undefined;
    calories?: number | undefined;
}, {
    name: string;
    categoryId: string;
    description: string;
    basePrice: number;
    prepTimeMinutes?: number | undefined;
    isSpicy?: boolean | undefined;
    isVegetarian?: boolean | undefined;
    isVegan?: boolean | undefined;
    isGlutenFree?: boolean | undefined;
    isChefsPick?: boolean | undefined;
    isAvailable?: boolean | undefined;
    moodTags?: ("COMFORT_FOOD" | "QUICK_BITE" | "DATE_NIGHT" | "HEALTHY" | "ADVENTUROUS" | "BUDGET_FRIENDLY" | "CELEBRATION" | "POST_WORKOUT" | "SPICY" | "SHARING" | "LATE_NIGHT" | "BREAKFAST")[] | undefined;
    calories?: number | undefined;
    allergens?: string[] | undefined;
    customizationGroups?: {
        options: {
            name: string;
            id: string;
            priceModifier: number;
        }[];
        type: "RADIO" | "CHECKBOX";
        name: string;
        id: string;
        required: boolean;
    }[] | undefined;
    sortOrder?: number | undefined;
}>;
export declare const updateMenuItemSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    basePrice: z.ZodOptional<z.ZodNumber>;
    prepTimeMinutes: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    isSpicy: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isVegetarian: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isVegan: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isGlutenFree: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isChefsPick: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isAvailable: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    moodTags: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodEnum<["COMFORT_FOOD", "QUICK_BITE", "DATE_NIGHT", "HEALTHY", "ADVENTUROUS", "BUDGET_FRIENDLY", "CELEBRATION", "POST_WORKOUT", "SPICY", "SHARING", "LATE_NIGHT", "BREAKFAST"]>, "many">>>;
    calories: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    allergens: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    customizationGroups: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        type: z.ZodEnum<["RADIO", "CHECKBOX"]>;
        required: z.ZodBoolean;
        options: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            priceModifier: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            id: string;
            priceModifier: number;
        }, {
            name: string;
            id: string;
            priceModifier: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        options: {
            name: string;
            id: string;
            priceModifier: number;
        }[];
        type: "RADIO" | "CHECKBOX";
        name: string;
        id: string;
        required: boolean;
    }, {
        options: {
            name: string;
            id: string;
            priceModifier: number;
        }[];
        type: "RADIO" | "CHECKBOX";
        name: string;
        id: string;
        required: boolean;
    }>, "many">>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    categoryId?: string | undefined;
    description?: string | undefined;
    basePrice?: number | undefined;
    prepTimeMinutes?: number | undefined;
    isSpicy?: boolean | undefined;
    isVegetarian?: boolean | undefined;
    isVegan?: boolean | undefined;
    isGlutenFree?: boolean | undefined;
    isChefsPick?: boolean | undefined;
    isAvailable?: boolean | undefined;
    moodTags?: ("COMFORT_FOOD" | "QUICK_BITE" | "DATE_NIGHT" | "HEALTHY" | "ADVENTUROUS" | "BUDGET_FRIENDLY" | "CELEBRATION" | "POST_WORKOUT" | "SPICY" | "SHARING" | "LATE_NIGHT" | "BREAKFAST")[] | undefined;
    calories?: number | undefined;
    allergens?: string[] | undefined;
    customizationGroups?: {
        options: {
            name: string;
            id: string;
            priceModifier: number;
        }[];
        type: "RADIO" | "CHECKBOX";
        name: string;
        id: string;
        required: boolean;
    }[] | undefined;
    sortOrder?: number | undefined;
}, {
    name?: string | undefined;
    categoryId?: string | undefined;
    description?: string | undefined;
    basePrice?: number | undefined;
    prepTimeMinutes?: number | undefined;
    isSpicy?: boolean | undefined;
    isVegetarian?: boolean | undefined;
    isVegan?: boolean | undefined;
    isGlutenFree?: boolean | undefined;
    isChefsPick?: boolean | undefined;
    isAvailable?: boolean | undefined;
    moodTags?: ("COMFORT_FOOD" | "QUICK_BITE" | "DATE_NIGHT" | "HEALTHY" | "ADVENTUROUS" | "BUDGET_FRIENDLY" | "CELEBRATION" | "POST_WORKOUT" | "SPICY" | "SHARING" | "LATE_NIGHT" | "BREAKFAST")[] | undefined;
    calories?: number | undefined;
    allergens?: string[] | undefined;
    customizationGroups?: {
        options: {
            name: string;
            id: string;
            priceModifier: number;
        }[];
        type: "RADIO" | "CHECKBOX";
        name: string;
        id: string;
        required: boolean;
    }[] | undefined;
    sortOrder?: number | undefined;
}>;
export declare const createMenuCategorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sortOrder: number;
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    sortOrder?: number | undefined;
}>;
export declare const updateMenuCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    sortOrder?: number | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    sortOrder?: number | undefined;
}>;
export declare const dayHoursSchema: z.ZodObject<{
    open: z.ZodString;
    close: z.ZodString;
    closed: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    open: string;
    close: string;
    closed: boolean;
}, {
    open: string;
    close: string;
    closed: boolean;
}>;
export declare const operatingHoursSchema: z.ZodObject<{
    mon: z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        open: string;
        close: string;
        closed: boolean;
    }, {
        open: string;
        close: string;
        closed: boolean;
    }>;
    tue: z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        open: string;
        close: string;
        closed: boolean;
    }, {
        open: string;
        close: string;
        closed: boolean;
    }>;
    wed: z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        open: string;
        close: string;
        closed: boolean;
    }, {
        open: string;
        close: string;
        closed: boolean;
    }>;
    thu: z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        open: string;
        close: string;
        closed: boolean;
    }, {
        open: string;
        close: string;
        closed: boolean;
    }>;
    fri: z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        open: string;
        close: string;
        closed: boolean;
    }, {
        open: string;
        close: string;
        closed: boolean;
    }>;
    sat: z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        open: string;
        close: string;
        closed: boolean;
    }, {
        open: string;
        close: string;
        closed: boolean;
    }>;
    sun: z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
        closed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        open: string;
        close: string;
        closed: boolean;
    }, {
        open: string;
        close: string;
        closed: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    mon: {
        open: string;
        close: string;
        closed: boolean;
    };
    tue: {
        open: string;
        close: string;
        closed: boolean;
    };
    wed: {
        open: string;
        close: string;
        closed: boolean;
    };
    thu: {
        open: string;
        close: string;
        closed: boolean;
    };
    fri: {
        open: string;
        close: string;
        closed: boolean;
    };
    sat: {
        open: string;
        close: string;
        closed: boolean;
    };
    sun: {
        open: string;
        close: string;
        closed: boolean;
    };
}, {
    mon: {
        open: string;
        close: string;
        closed: boolean;
    };
    tue: {
        open: string;
        close: string;
        closed: boolean;
    };
    wed: {
        open: string;
        close: string;
        closed: boolean;
    };
    thu: {
        open: string;
        close: string;
        closed: boolean;
    };
    fri: {
        open: string;
        close: string;
        closed: boolean;
    };
    sat: {
        open: string;
        close: string;
        closed: boolean;
    };
    sun: {
        open: string;
        close: string;
        closed: boolean;
    };
}>;
export declare const updateRestaurantSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    story: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    email: z.ZodOptional<z.ZodString>;
    website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    instagramHandle: z.ZodOptional<z.ZodString>;
    facebookUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    minimumOrder: z.ZodOptional<z.ZodNumber>;
    deliveryFeeBase: z.ZodOptional<z.ZodNumber>;
    deliveryFeePerKm: z.ZodOptional<z.ZodNumber>;
    deliveryRadiusKm: z.ZodOptional<z.ZodNumber>;
    avgPrepTimeMinutes: z.ZodOptional<z.ZodNumber>;
    isHalalCertified: z.ZodOptional<z.ZodBoolean>;
    isVegetarianFriendly: z.ZodOptional<z.ZodBoolean>;
    isVeganFriendly: z.ZodOptional<z.ZodBoolean>;
    operatingHours: z.ZodOptional<z.ZodObject<{
        mon: z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            open: string;
            close: string;
            closed: boolean;
        }, {
            open: string;
            close: string;
            closed: boolean;
        }>;
        tue: z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            open: string;
            close: string;
            closed: boolean;
        }, {
            open: string;
            close: string;
            closed: boolean;
        }>;
        wed: z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            open: string;
            close: string;
            closed: boolean;
        }, {
            open: string;
            close: string;
            closed: boolean;
        }>;
        thu: z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            open: string;
            close: string;
            closed: boolean;
        }, {
            open: string;
            close: string;
            closed: boolean;
        }>;
        fri: z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            open: string;
            close: string;
            closed: boolean;
        }, {
            open: string;
            close: string;
            closed: boolean;
        }>;
        sat: z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            open: string;
            close: string;
            closed: boolean;
        }, {
            open: string;
            close: string;
            closed: boolean;
        }>;
        sun: z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
            closed: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            open: string;
            close: string;
            closed: boolean;
        }, {
            open: string;
            close: string;
            closed: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        mon: {
            open: string;
            close: string;
            closed: boolean;
        };
        tue: {
            open: string;
            close: string;
            closed: boolean;
        };
        wed: {
            open: string;
            close: string;
            closed: boolean;
        };
        thu: {
            open: string;
            close: string;
            closed: boolean;
        };
        fri: {
            open: string;
            close: string;
            closed: boolean;
        };
        sat: {
            open: string;
            close: string;
            closed: boolean;
        };
        sun: {
            open: string;
            close: string;
            closed: boolean;
        };
    }, {
        mon: {
            open: string;
            close: string;
            closed: boolean;
        };
        tue: {
            open: string;
            close: string;
            closed: boolean;
        };
        wed: {
            open: string;
            close: string;
            closed: boolean;
        };
        thu: {
            open: string;
            close: string;
            closed: boolean;
        };
        fri: {
            open: string;
            close: string;
            closed: boolean;
        };
        sat: {
            open: string;
            close: string;
            closed: boolean;
        };
        sun: {
            open: string;
            close: string;
            closed: boolean;
        };
    }>>;
    payoutMethod: z.ZodOptional<z.ZodEnum<["MPESA", "BANK"]>>;
    payoutPhone: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    payoutBankName: z.ZodOptional<z.ZodString>;
    payoutAccountNumber: z.ZodOptional<z.ZodString>;
    payoutAccountName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
    description?: string | undefined;
    story?: string | undefined;
    website?: string | undefined;
    instagramHandle?: string | undefined;
    facebookUrl?: string | undefined;
    minimumOrder?: number | undefined;
    deliveryFeeBase?: number | undefined;
    deliveryFeePerKm?: number | undefined;
    deliveryRadiusKm?: number | undefined;
    avgPrepTimeMinutes?: number | undefined;
    isHalalCertified?: boolean | undefined;
    isVegetarianFriendly?: boolean | undefined;
    isVeganFriendly?: boolean | undefined;
    operatingHours?: {
        mon: {
            open: string;
            close: string;
            closed: boolean;
        };
        tue: {
            open: string;
            close: string;
            closed: boolean;
        };
        wed: {
            open: string;
            close: string;
            closed: boolean;
        };
        thu: {
            open: string;
            close: string;
            closed: boolean;
        };
        fri: {
            open: string;
            close: string;
            closed: boolean;
        };
        sat: {
            open: string;
            close: string;
            closed: boolean;
        };
        sun: {
            open: string;
            close: string;
            closed: boolean;
        };
    } | undefined;
    payoutMethod?: "MPESA" | "BANK" | undefined;
    payoutPhone?: string | undefined;
    payoutBankName?: string | undefined;
    payoutAccountNumber?: string | undefined;
    payoutAccountName?: string | undefined;
}, {
    phone?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
    description?: string | undefined;
    story?: string | undefined;
    website?: string | undefined;
    instagramHandle?: string | undefined;
    facebookUrl?: string | undefined;
    minimumOrder?: number | undefined;
    deliveryFeeBase?: number | undefined;
    deliveryFeePerKm?: number | undefined;
    deliveryRadiusKm?: number | undefined;
    avgPrepTimeMinutes?: number | undefined;
    isHalalCertified?: boolean | undefined;
    isVegetarianFriendly?: boolean | undefined;
    isVeganFriendly?: boolean | undefined;
    operatingHours?: {
        mon: {
            open: string;
            close: string;
            closed: boolean;
        };
        tue: {
            open: string;
            close: string;
            closed: boolean;
        };
        wed: {
            open: string;
            close: string;
            closed: boolean;
        };
        thu: {
            open: string;
            close: string;
            closed: boolean;
        };
        fri: {
            open: string;
            close: string;
            closed: boolean;
        };
        sat: {
            open: string;
            close: string;
            closed: boolean;
        };
        sun: {
            open: string;
            close: string;
            closed: boolean;
        };
    } | undefined;
    payoutMethod?: "MPESA" | "BANK" | undefined;
    payoutPhone?: string | undefined;
    payoutBankName?: string | undefined;
    payoutAccountNumber?: string | undefined;
    payoutAccountName?: string | undefined;
}>;
export declare const updateRiderLocationSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    heading: z.ZodOptional<z.ZodNumber>;
    speed: z.ZodOptional<z.ZodNumber>;
    accuracy: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    latitude: number;
    longitude: number;
    heading?: number | undefined;
    speed?: number | undefined;
    accuracy?: number | undefined;
}, {
    latitude: number;
    longitude: number;
    heading?: number | undefined;
    speed?: number | undefined;
    accuracy?: number | undefined;
}>;
export declare const updateRiderStatusSchema: z.ZodObject<{
    isOnline: z.ZodBoolean;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    isOnline: boolean;
    latitude?: number | undefined;
    longitude?: number | undefined;
}, {
    isOnline: boolean;
    latitude?: number | undefined;
    longitude?: number | undefined;
}>;
export declare const createSupportTicketSchema: z.ZodObject<{
    orderId: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["ORDER_ISSUE", "PAYMENT_ISSUE", "DELIVERY_ISSUE", "RESTAURANT_ISSUE", "ACCOUNT_ISSUE", "REFUND_REQUEST", "GENERAL_INQUIRY", "OTHER"]>;
    subject: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    category: "OTHER" | "ORDER_ISSUE" | "PAYMENT_ISSUE" | "DELIVERY_ISSUE" | "RESTAURANT_ISSUE" | "ACCOUNT_ISSUE" | "REFUND_REQUEST" | "GENERAL_INQUIRY";
    subject: string;
    orderId?: string | undefined;
}, {
    message: string;
    category: "OTHER" | "ORDER_ISSUE" | "PAYMENT_ISSUE" | "DELIVERY_ISSUE" | "RESTAURANT_ISSUE" | "ACCOUNT_ISSUE" | "REFUND_REQUEST" | "GENERAL_INQUIRY";
    subject: string;
    orderId?: string | undefined;
}>;
export declare const createTicketMessageSchema: z.ZodObject<{
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
}, {
    message: string;
}>;
export declare const validatePromoSchema: z.ZodObject<{
    code: z.ZodString;
    restaurantId: z.ZodString;
    orderSubtotal: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    code: string;
    restaurantId: string;
    orderSubtotal: number;
}, {
    code: string;
    restaurantId: string;
    orderSubtotal: number;
}>;
export declare const createPromoSchema: z.ZodObject<{
    code: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    customerDescription: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["PERCENTAGE", "FIXED_AMOUNT", "FREE_DELIVERY", "FIRST_ORDER"]>;
    discountValue: z.ZodNumber;
    maxDiscountAmount: z.ZodOptional<z.ZodNumber>;
    minimumOrderAmount: z.ZodDefault<z.ZodNumber>;
    newUsersOnly: z.ZodDefault<z.ZodBoolean>;
    firstOrderOnly: z.ZodDefault<z.ZodBoolean>;
    usageLimit: z.ZodOptional<z.ZodNumber>;
    usageLimitPerUser: z.ZodDefault<z.ZodNumber>;
    validFrom: z.ZodString;
    validTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_DELIVERY" | "FIRST_ORDER";
    discountValue: number;
    minimumOrderAmount: number;
    newUsersOnly: boolean;
    firstOrderOnly: boolean;
    usageLimitPerUser: number;
    validFrom: string;
    description?: string | undefined;
    customerDescription?: string | undefined;
    maxDiscountAmount?: number | undefined;
    usageLimit?: number | undefined;
    validTo?: string | undefined;
}, {
    code: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_DELIVERY" | "FIRST_ORDER";
    discountValue: number;
    validFrom: string;
    description?: string | undefined;
    customerDescription?: string | undefined;
    maxDiscountAmount?: number | undefined;
    minimumOrderAmount?: number | undefined;
    newUsersOnly?: boolean | undefined;
    firstOrderOnly?: boolean | undefined;
    usageLimit?: number | undefined;
    usageLimitPerUser?: number | undefined;
    validTo?: string | undefined;
}>;
export declare const createCollectionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    emoji: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isPublic: boolean;
    description?: string | undefined;
    emoji?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    emoji?: string | undefined;
    isPublic?: boolean | undefined;
}>;
export declare const addCollectionItemSchema: z.ZodObject<{
    menuItemId: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    menuItemId: string;
    note?: string | undefined;
}, {
    menuItemId: string;
    note?: string | undefined;
}>;
export declare const approveRestaurantSchema: z.ZodObject<{
    commissionPercent: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    commissionPercent: number;
    notes?: string | undefined;
}, {
    commissionPercent?: number | undefined;
    notes?: string | undefined;
}>;
export declare const rejectRestaurantSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
export declare const suspendRestaurantSchema: z.ZodObject<{
    reason: z.ZodString;
    suspendedUntil: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    suspendedUntil?: string | undefined;
}, {
    reason: string;
    suspendedUntil?: string | undefined;
}>;
export declare const updateCommissionSchema: z.ZodObject<{
    commissionPercent: z.ZodNumber;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    commissionPercent: number;
    reason?: string | undefined;
}, {
    commissionPercent: number;
    reason?: string | undefined;
}>;
export declare const broadcastNotificationSchema: z.ZodObject<{
    title: z.ZodString;
    body: z.ZodString;
    target: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    scheduleFor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    body: string;
    target: string;
    data?: Record<string, string> | undefined;
    scheduleFor?: string | undefined;
}, {
    title: string;
    body: string;
    target: string;
    data?: Record<string, string> | undefined;
    scheduleFor?: string | undefined;
}>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type AppleAuthInput = z.infer<typeof appleAuthSchema>;
export type RestaurantLoginInput = z.infer<typeof restaurantLoginSchema>;
export type RestaurantRegisterInput = z.infer<typeof restaurantRegisterSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type CreateMenuCategoryInput = z.infer<typeof createMenuCategorySchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
export type UpdateRiderLocationInput = z.infer<typeof updateRiderLocationSchema>;
export type ValidatePromoInput = z.infer<typeof validatePromoSchema>;
export type CreatePromoInput = z.infer<typeof createPromoSchema>;
export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type BroadcastNotificationInput = z.infer<typeof broadcastNotificationSchema>;
//# sourceMappingURL=index.d.ts.map
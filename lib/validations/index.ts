import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(80),
  email: z.string().trim().email('Email invalide').toLowerCase(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s]{8,15}$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(72),
})
export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1, 'Mot de passe requis'),
})

export const selectedOptionSchema = z.object({
  optionId: z.string(),
  optionName: z.string(),
  valueId: z.string(),
  label: z.string(),
  priceDelta: z.number().int().default(0),
})

export const selectedAddonSchema = z.object({
  addonId: z.string(),
  name: z.string(),
  price: z.number().int(),
  quantity: z.number().int().min(1).max(10),
})

export const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(20).default(1),
  selectedOptions: z.array(selectedOptionSchema).default([]),
  selectedAddons: z.array(selectedAddonSchema).default([]),
  note: z.string().max(280).optional(),
})
export type AddToCartInput = z.infer<typeof addToCartSchema>

export const updateCartItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().min(0).max(20),
})

export const checkoutSchema = z
  .object({
    orderType: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']),
    restaurantId: z.string().min(1, 'Choisissez un restaurant'),
    addressId: z.string().optional(),
    newAddress: z
      .object({
        label: z.string().default('Maison'),
        line1: z.string().min(4, 'Adresse trop courte'),
        line2: z.string().optional(),
        commune: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
      })
      .optional(),
    tableId: z.string().optional(),
    scheduledFor: z.string().datetime().optional(),
    paymentMethod: z.enum(['MOBILE_MONEY', 'CARD', 'CASH']),
    couponCode: z.string().optional(),
    contactName: z.string().min(2, 'Nom requis'),
    contactPhone: z.string().regex(/^\+?[0-9\s]{8,15}$/, 'Téléphone invalide'),
    contactEmail: z.string().email().optional().or(z.literal('')),
    notes: z.string().max(300).optional(),
  })
  .refine((data) => data.orderType !== 'DELIVERY' || data.addressId || data.newAddress, {
    message: 'Une adresse est requise pour la livraison',
    path: ['addressId'],
  })
export type CheckoutInput = z.infer<typeof checkoutSchema>

export const reservationSchema = z.object({
  restaurantId: z.string().min(1, 'Choisissez un restaurant'),
  date: z.string().min(1, 'Date requise'),
  time: z.string().min(1, 'Heure requise'),
  partySize: z.number().int().min(1).max(40),
  name: z.string().min(2, 'Nom requis'),
  phone: z.string().regex(/^\+?[0-9\s]{8,15}$/, 'Téléphone invalide'),
  email: z.string().email().optional().or(z.literal('')),
  specialRequest: z.string().max(300).optional(),
})
export type ReservationInput = z.infer<typeof reservationSchema>

export const reviewSchema = z.object({
  orderId: z.string().optional(),
  productId: z.string().optional(),
  foodRating: z.number().int().min(1).max(5),
  serviceRating: z.number().int().min(1).max(5).optional(),
  ambianceRating: z.number().int().min(1).max(5).optional(),
  deliveryRating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(600).optional(),
})
export type ReviewInput = z.infer<typeof reviewSchema>

export const eventRequestSchema = z.object({
  type: z.enum(['BIRTHDAY', 'MEETING', 'SPORTS', 'PRIVATE_PARTY', 'CORPORATE', 'CELEBRATION']),
  date: z.string().min(1, 'Date requise'),
  guestCount: z.number().int().min(1).max(1000),
  budget: z.number().int().min(0).optional(),
  restaurantId: z.string().optional(),
  message: z.string().max(600).optional(),
  name: z.string().min(2, 'Nom requis'),
  phone: z.string().regex(/^\+?[0-9\s]{8,15}$/, 'Téléphone invalide'),
  email: z.string().email('Email invalide'),
})
export type EventRequestInput = z.infer<typeof eventRequestSchema>

export const corporateRequestSchema = z.object({
  companyName: z.string().min(2, "Nom de l'entreprise requis"),
  contactName: z.string().min(2, 'Nom du contact requis'),
  phone: z.string().regex(/^\+?[0-9\s]{8,15}$/, 'Téléphone invalide'),
  email: z.string().email('Email invalide'),
  employeeCount: z.number().int().min(1).optional(),
  deliveryFrequency: z.string().optional(),
  budget: z.number().int().min(0).optional(),
  message: z.string().max(600).optional(),
})
export type CorporateRequestInput = z.infer<typeof corporateRequestSchema>

export const addressSchema = z.object({
  label: z.string().min(1).default('Maison'),
  line1: z.string().min(4, 'Adresse trop courte'),
  line2: z.string().optional(),
  commune: z.string().optional(),
  isDefault: z.boolean().default(false),
})

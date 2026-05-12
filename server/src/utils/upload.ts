import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Configure Cloudinary
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UPLOAD FOLDERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const UPLOAD_FOLDERS = {
  AVATARS: 'chakula/avatars',
  RESTAURANT_LOGOS: 'chakula/restaurants/logos',
  RESTAURANT_COVERS: 'chakula/restaurants/covers',
  RESTAURANT_GALLERY: 'chakula/restaurants/gallery',
  MENU_ITEMS: 'chakula/menu',
  REVIEWS: 'chakula/reviews',
  DOCUMENTS: 'chakula/documents',
  BANNERS: 'chakula/banners',
} as const

export type UploadFolder = typeof UPLOAD_FOLDERS[keyof typeof UPLOAD_FOLDERS]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERATE SIGNED UPLOAD PARAMS
// Client uploads directly to Cloudinary using these params
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function generateSignedUploadParams(
  folder: UploadFolder,
  options: {
    maxFileSizeMb?: number
    allowedFormats?: string[]
    transformation?: Record<string, unknown>
  } = {}
) {
  const timestamp = Math.round(new Date().getTime() / 1000)

  const {
    maxFileSizeMb = 10,
    allowedFormats = ['jpg', 'jpeg', 'png', 'webp'],
  } = options

  const params: Record<string, unknown> = {
    timestamp,
    folder,
    allowed_formats: allowedFormats.join(','),
    max_file_size: maxFileSizeMb * 1024 * 1024,
  }

  // Add transformation for images (auto-optimize)
  if (folder !== UPLOAD_FOLDERS.DOCUMENTS) {
    params.transformation = 'q_auto,f_auto'
  }

  // Generate signature
  const signature = cloudinary.utils.api_sign_request(
    params,
    env.CLOUDINARY_API_SECRET
  )

  return {
    signature,
    timestamp,
    folder,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    maxFileSizeMb,
    allowedFormats,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELETE IMAGE FROM CLOUDINARY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
    logger.info({ publicId }, 'Image deleted from Cloudinary')
  } catch (error) {
    logger.error({ error, publicId }, 'Failed to delete image from Cloudinary')
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXTRACT PUBLIC ID FROM CLOUDINARY URL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function extractPublicId(cloudinaryUrl: string): string | null {
  try {
    const matches = cloudinaryUrl.match(/\/v\d+\/(.+)\.[a-z]+$/)
    return matches?.[1] ?? null
  } catch {
    return null
  }
}
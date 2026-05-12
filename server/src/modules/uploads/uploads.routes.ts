import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { generateSignedUploadParams, UPLOAD_FOLDERS } from '../../utils/upload.js'
import { ValidationError } from '../../utils/errors.js'

const VALID_CONTEXTS = {
  avatar: UPLOAD_FOLDERS.AVATARS,
  restaurant_logo: UPLOAD_FOLDERS.RESTAURANT_LOGOS,
  restaurant_cover: UPLOAD_FOLDERS.RESTAURANT_COVERS,
  restaurant_gallery: UPLOAD_FOLDERS.RESTAURANT_GALLERY,
  menu_item: UPLOAD_FOLDERS.MENU_ITEMS,
  review: UPLOAD_FOLDERS.REVIEWS,
  document: UPLOAD_FOLDERS.DOCUMENTS,
} as const

type UploadContext = keyof typeof VALID_CONTEXTS

export async function uploadRoutes(fastify: FastifyInstance): Promise<void> {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POST /v1/uploads/sign
  // Get signed params to upload directly to Cloudinary
  // Auth: Required
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  fastify.post('/uploads/sign', {
    preHandler: [fastify.authenticate],
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as Record<string, unknown>
    const context = (body.context as UploadContext) ?? 'avatar'

    if (!VALID_CONTEXTS[context]) {
      throw new ValidationError('Invalid upload context', [
        {
          field: 'context',
          message: `Must be one of: ${Object.keys(VALID_CONTEXTS).join(', ')}`,
        },
      ])
    }

    const folder = VALID_CONTEXTS[context]

    // Set limits based on context
    const options = context === 'document'
      ? { maxFileSizeMb: 10, allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'] }
      : { maxFileSizeMb: 5, allowedFormats: ['jpg', 'jpeg', 'png', 'webp'] }

    const params = generateSignedUploadParams(folder, options)

    reply.send({
      success: true,
      message: 'Upload signature generated',
      data: params,
    })
  })
}
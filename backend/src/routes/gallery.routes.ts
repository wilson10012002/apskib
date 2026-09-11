import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { runOrNotFound } from '../utils/prismaHelpers'
import { validateBody } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'
import { uploadImage, publicUrlFor } from '../middleware/upload'

export const galleryRouter = Router()

// Converte o valor de um checkbox HTML ("true"/"false"/"on"/undefined)
// vindo de multipart/form-data num boolean real.
const formBoolean = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((value) => value === true || value === 'true' || value === 'on')

const galleryCreateSchema = z.object({
  caption: z.string().optional(),
  featured: formBoolean,
  order: z.coerce.number().int().default(0),
})

const galleryUpdateSchema = z.object({
  caption: z.string().optional(),
  featured: formBoolean,
  order: z.coerce.number().int().optional(),
})

galleryRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const images = await prisma.galleryImage.findMany({ orderBy: [{ featured: 'desc' }, { order: 'asc' }] })
    res.json(images)
  }),
)

galleryRouter.post(
  '/',
  requireAuth,
  uploadImage.single('image'),
  validateBody(galleryCreateSchema),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw ApiError.badRequest('É necessário enviar uma imagem.')
    }

    const image = await prisma.galleryImage.create({
      data: {
        ...req.body,
        url: publicUrlFor(req, `images/${req.file.filename}`),
      },
    })

    res.status(201).json(image)
  }),
)

galleryRouter.put(
  '/:id',
  requireAuth,
  validateBody(galleryUpdateSchema),
  asyncHandler(async (req, res) => {
    const image = await runOrNotFound(
      prisma.galleryImage.update({ where: { id: req.params.id }, data: req.body }),
      'Imagem não encontrada.',
    )
    res.json(image)
  }),
)

galleryRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await runOrNotFound(prisma.galleryImage.delete({ where: { id: req.params.id } }), 'Imagem não encontrada.')
    res.status(204).send()
  }),
)

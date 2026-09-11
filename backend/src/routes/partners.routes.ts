import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { runOrNotFound } from '../utils/prismaHelpers'
import { validateBody } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'
import { uploadImage, publicUrlFor } from '../middleware/upload'

export const partnersRouter = Router()

// Estes endpoints recebem multipart/form-data (por causa do upload do
// logótipo), pelo que os campos não-ficheiro chegam sempre como string —
// por isso usamos z.coerce para números.
const partnerSchema = z.object({
  name: z.string().min(1),
  website: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  order: z.coerce.number().int().default(0),
})

partnersRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const partners = await prisma.partner.findMany({ orderBy: { order: 'asc' } })
    res.json(partners)
  }),
)

partnersRouter.post(
  '/',
  requireAuth,
  uploadImage.single('logo'),
  validateBody(partnerSchema),
  asyncHandler(async (req, res) => {
    const logoUrl = req.file ? publicUrlFor(req, `images/${req.file.filename}`) : undefined

    const partner = await prisma.partner.create({
      data: { ...req.body, logoUrl },
    })

    res.status(201).json(partner)
  }),
)

partnersRouter.put(
  '/:id',
  requireAuth,
  uploadImage.single('logo'),
  validateBody(partnerSchema.partial()),
  asyncHandler(async (req, res) => {
    const logoUrl = req.file ? publicUrlFor(req, `images/${req.file.filename}`) : undefined

    const partner = await runOrNotFound(
      prisma.partner.update({
        where: { id: req.params.id },
        data: { ...req.body, ...(logoUrl ? { logoUrl } : {}) },
      }),
      'Parceiro não encontrado.',
    )

    res.json(partner)
  }),
)

partnersRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await runOrNotFound(prisma.partner.delete({ where: { id: req.params.id } }), 'Parceiro não encontrado.')
    res.status(204).send()
  }),
)

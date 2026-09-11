import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { runOrNotFound } from '../utils/prismaHelpers'
import { validateBody } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'
import { uploadDocument, publicUrlFor } from '../middleware/upload'

export const documentsRouter = Router()

// multipart/form-data -> campos não-ficheiro chegam sempre como string.
const documentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
})

documentsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const documents = await prisma.documentFile.findMany({ orderBy: { uploadedAt: 'desc' } })
    res.json(documents)
  }),
)

documentsRouter.post(
  '/',
  requireAuth,
  uploadDocument.single('file'),
  validateBody(documentSchema),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw ApiError.badRequest('É necessário enviar um ficheiro.')
    }

    const document = await prisma.documentFile.create({
      data: {
        ...req.body,
        fileUrl: publicUrlFor(req, `documents/${req.file.filename}`),
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      },
    })

    res.status(201).json(document)
  }),
)

documentsRouter.put(
  '/:id',
  requireAuth,
  validateBody(documentSchema.partial()),
  asyncHandler(async (req, res) => {
    const document = await runOrNotFound(
      prisma.documentFile.update({ where: { id: req.params.id }, data: req.body }),
      'Documento não encontrado.',
    )
    res.json(document)
  }),
)

documentsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await runOrNotFound(prisma.documentFile.delete({ where: { id: req.params.id } }), 'Documento não encontrado.')
    res.status(204).send()
  }),
)

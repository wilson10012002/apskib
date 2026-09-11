import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { runOrNotFound } from '../utils/prismaHelpers'
import { validateBody, validateQuery } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'

export const rankingRouter = Router()

const rankingSchema = z.object({
  athleteId: z.string().optional(),
  athleteName: z.string().min(1),
  clubName: z.string().optional(),
  points: z.number().int().min(0),
  categoryId: z.string().optional(),
})

const listQuerySchema = z.object({
  categoryId: z.string().optional(),
})

rankingRouter.get(
  '/',
  validateQuery(listQuerySchema),
  asyncHandler(async (req, res) => {
    const { categoryId } = req.query as z.infer<typeof listQuerySchema>

    const ranking = await prisma.rankingEntry.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
      orderBy: { points: 'desc' },
    })

    res.json(ranking)
  }),
)

rankingRouter.post(
  '/',
  requireAuth,
  validateBody(rankingSchema),
  asyncHandler(async (req, res) => {
    const entry = await prisma.rankingEntry.create({ data: req.body })
    res.status(201).json(entry)
  }),
)

rankingRouter.put(
  '/:id',
  requireAuth,
  validateBody(rankingSchema.partial()),
  asyncHandler(async (req, res) => {
    const entry = await runOrNotFound(
      prisma.rankingEntry.update({ where: { id: req.params.id }, data: req.body }),
      'Entrada de ranking não encontrada.',
    )
    res.json(entry)
  }),
)

rankingRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await runOrNotFound(prisma.rankingEntry.delete({ where: { id: req.params.id } }), 'Entrada de ranking não encontrada.')
    res.status(204).send()
  }),
)

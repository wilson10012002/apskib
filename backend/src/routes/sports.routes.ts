import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { runOrNotFound } from '../utils/prismaHelpers'
import { validateBody } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'

export const sportsRouter = Router()

const sportSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  color: z.enum(['red', 'blue', 'green']),
  description: z.string().min(1),
  rules: z.array(z.string().min(1)).default([]),
  order: z.number().int().default(0),
})

sportsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const sports = await prisma.sport.findMany({ orderBy: { order: 'asc' } })
    res.json(sports)
  }),
)

sportsRouter.post(
  '/',
  requireAuth,
  validateBody(sportSchema),
  asyncHandler(async (req, res) => {
    const sport = await prisma.sport.create({ data: req.body })
    res.status(201).json(sport)
  }),
)

sportsRouter.put(
  '/:id',
  requireAuth,
  validateBody(sportSchema.partial()),
  asyncHandler(async (req, res) => {
    const sport = await runOrNotFound(
      prisma.sport.update({ where: { id: req.params.id }, data: req.body }),
      'Modalidade não encontrada.',
    )
    res.json(sport)
  }),
)

sportsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await runOrNotFound(prisma.sport.delete({ where: { id: req.params.id } }), 'Modalidade não encontrada.')
    res.status(204).send()
  }),
)

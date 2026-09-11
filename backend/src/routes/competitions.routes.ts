import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { runOrNotFound } from '../utils/prismaHelpers'
import { validateBody } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'

export const competitionsRouter = Router()

const competitionSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  location: z.string().min(1),
  categoryLabel: z.string().min(1),
  status: z.enum(['scheduled', 'completed']).default('scheduled'),
})

competitionsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const competitions = await prisma.competition.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(competitions)
  }),
)

competitionsRouter.post(
  '/',
  requireAuth,
  validateBody(competitionSchema),
  asyncHandler(async (req, res) => {
    const competition = await prisma.competition.create({ data: req.body })
    res.status(201).json(competition)
  }),
)

competitionsRouter.put(
  '/:id',
  requireAuth,
  validateBody(competitionSchema.partial()),
  asyncHandler(async (req, res) => {
    const competition = await runOrNotFound(
      prisma.competition.update({ where: { id: req.params.id }, data: req.body }),
      'Competição não encontrada.',
    )
    res.json(competition)
  }),
)

competitionsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await runOrNotFound(prisma.competition.delete({ where: { id: req.params.id } }), 'Competição não encontrada.')
    res.status(204).send()
  }),
)

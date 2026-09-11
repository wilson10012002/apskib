import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { runOrNotFound } from '../utils/prismaHelpers'
import { validateBody, validateQuery } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'

export const resultsRouter = Router()

const resultSchema = z.object({
  competitionId: z.string().min(1),
  sportId: z.string().optional(),
  categoryId: z.string().optional(),
  athleteId: z.string().optional(),
  athleteName: z.string().min(1),
  position: z.number().int().min(1),
  notes: z.string().optional(),
})

const listQuerySchema = z.object({
  competitionId: z.string().optional(),
})

resultsRouter.get(
  '/',
  validateQuery(listQuerySchema),
  asyncHandler(async (req, res) => {
    const { competitionId } = req.query as z.infer<typeof listQuerySchema>

    const results = await prisma.result.findMany({
      where: competitionId ? { competitionId } : undefined,
      include: { competition: true, sport: true, category: true },
      orderBy: [{ competitionId: 'asc' }, { position: 'asc' }],
    })

    res.json(results)
  }),
)

resultsRouter.post(
  '/',
  requireAuth,
  validateBody(resultSchema),
  asyncHandler(async (req, res) => {
    const result = await prisma.result.create({ data: req.body })
    res.status(201).json(result)
  }),
)

resultsRouter.put(
  '/:id',
  requireAuth,
  validateBody(resultSchema.partial()),
  asyncHandler(async (req, res) => {
    const result = await runOrNotFound(
      prisma.result.update({ where: { id: req.params.id }, data: req.body }),
      'Resultado não encontrado.',
    )
    res.json(result)
  }),
)

resultsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await runOrNotFound(prisma.result.delete({ where: { id: req.params.id } }), 'Resultado não encontrado.')
    res.status(204).send()
  }),
)

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { runOrNotFound } from '../utils/prismaHelpers'
import { validateBody } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'

export const categoriesRouter = Router()

const categorySchema = z.object({
  slug: z.string().min(1),
  label: z.string().min(1),
  ageRange: z.string().min(1),
  order: z.number().int().default(0),
})

categoriesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })
    res.json(categories)
  }),
)

categoriesRouter.post(
  '/',
  requireAuth,
  validateBody(categorySchema),
  asyncHandler(async (req, res) => {
    const category = await prisma.category.create({ data: req.body })
    res.status(201).json(category)
  }),
)

categoriesRouter.put(
  '/:id',
  requireAuth,
  validateBody(categorySchema.partial()),
  asyncHandler(async (req, res) => {
    const category = await runOrNotFound(
      prisma.category.update({ where: { id: req.params.id }, data: req.body }),
      'Categoria não encontrada.',
    )
    res.json(category)
  }),
)

categoriesRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await runOrNotFound(prisma.category.delete({ where: { id: req.params.id } }), 'Categoria não encontrada.')
    res.status(204).send()
  }),
)

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { runOrNotFound } from '../utils/prismaHelpers'
import { validateBody } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'
import { publicWriteLimiter } from '../middleware/rateLimit'

// Router público: GET /api/clubs (só aprovados) e POST /api/clubs
// (pedido de afiliação, fica "pending" até um admin aprovar).
export const clubsRouter = Router()

// Router de administração: GET /api/admin/clubs (todos os estados),
// PATCH de estado e edição/remoção.
export const clubsAdminRouter = Router()

const clubSchema = z.object({
  name: z.string().min(1, 'O nome do clube é obrigatório.'),
  city: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email('Email inválido.').optional(),
  contactPhone: z.string().optional(),
  logoUrl: z.string().url().optional(),
  notes: z.string().optional(),
})

const statusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
})

clubsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const clubs = await prisma.club.findMany({
      where: { status: 'approved' },
      orderBy: { name: 'asc' },
    })
    res.json(clubs)
  }),
)

clubsRouter.post(
  '/',
  publicWriteLimiter,
  validateBody(clubSchema),
  asyncHandler(async (req, res) => {
    const club = await prisma.club.create({ data: { ...req.body, status: 'pending' } })
    res.status(201).json({
      message: 'Pedido de afiliação recebido. A APSKIB irá analisar e entrar em contacto.',
      club,
    })
  }),
)

clubsAdminRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const clubs = await prisma.club.findMany({
      where: status ? { status: status as 'pending' | 'approved' | 'rejected' } : undefined,
      orderBy: { createdAt: 'desc' },
    })
    res.json(clubs)
  }),
)

clubsAdminRouter.put(
  '/:id',
  requireAuth,
  validateBody(clubSchema.partial()),
  asyncHandler(async (req, res) => {
    const club = await runOrNotFound(
      prisma.club.update({ where: { id: req.params.id }, data: req.body }),
      'Clube não encontrado.',
    )
    res.json(club)
  }),
)

clubsAdminRouter.patch(
  '/:id/status',
  requireAuth,
  validateBody(statusSchema),
  asyncHandler(async (req, res) => {
    const club = await runOrNotFound(
      prisma.club.update({ where: { id: req.params.id }, data: req.body }),
      'Clube não encontrado.',
    )
    res.json(club)
  }),
)

clubsAdminRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await runOrNotFound(prisma.club.delete({ where: { id: req.params.id } }), 'Clube não encontrado.')
    res.status(204).send()
  }),
)

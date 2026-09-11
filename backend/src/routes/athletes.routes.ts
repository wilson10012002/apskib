import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { runOrNotFound } from '../utils/prismaHelpers'
import { validateBody } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'

// Router público: apenas atletas aprovados e sem dados de contacto pessoais.
export const athletesRouter = Router()

// Router de administração: todos os atletas (incluindo pedidos "pending"),
// com todos os dados, edição e aprovação/rejeição.
export const athletesAdminRouter = Router()

const statusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
})

const athleteEditSchema = z.object({
  fullName: z.string().min(1).optional(),
  gender: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  clubId: z.string().nullable().optional(),
  clubName: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  competitionId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  sportIds: z.array(z.string()).optional(),
})

const publicAthleteSelect = {
  id: true,
  fullName: true,
  createdAt: true,
  club: { select: { name: true } },
  clubName: true,
  category: { select: { label: true } },
  sports: { select: { sport: { select: { name: true, slug: true } } } },
} as const

athletesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const athletes = await prisma.athlete.findMany({
      where: { status: 'approved' },
      select: publicAthleteSelect,
      orderBy: { fullName: 'asc' },
    })

    res.json(
      athletes.map((athlete) => ({
        id: athlete.id,
        fullName: athlete.fullName,
        club: athlete.club?.name ?? athlete.clubName ?? null,
        category: athlete.category?.label ?? null,
        sports: athlete.sports.map((entry) => entry.sport),
      })),
    )
  }),
)

athletesAdminRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const competitionId = typeof req.query.competitionId === 'string' ? req.query.competitionId : undefined

    const athletes = await prisma.athlete.findMany({
      where: {
        ...(status ? { status: status as 'pending' | 'approved' | 'rejected' } : {}),
        ...(competitionId ? { competitionId } : {}),
      },
      include: {
        club: true,
        category: true,
        competition: true,
        sports: { include: { sport: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(athletes)
  }),
)

athletesAdminRouter.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const athlete = await prisma.athlete.findUnique({
      where: { id: req.params.id },
      include: { club: true, category: true, competition: true, sports: { include: { sport: true } } },
    })

    if (!athlete) {
      res.status(404).json({ error: { message: 'Atleta não encontrado.' } })
      return
    }

    res.json(athlete)
  }),
)

athletesAdminRouter.put(
  '/:id',
  requireAuth,
  validateBody(athleteEditSchema),
  asyncHandler(async (req, res) => {
    const { sportIds, ...rest } = req.body as z.infer<typeof athleteEditSchema>

    const athlete = await runOrNotFound(
      prisma.athlete.update({
        where: { id: req.params.id },
        data: {
          ...rest,
          ...(sportIds
            ? {
                sports: {
                  deleteMany: {},
                  create: sportIds.map((sportId) => ({ sportId })),
                },
              }
            : {}),
        },
        include: { club: true, category: true, competition: true, sports: { include: { sport: true } } },
      }),
      'Atleta não encontrado.',
    )

    res.json(athlete)
  }),
)

athletesAdminRouter.patch(
  '/:id/status',
  requireAuth,
  validateBody(statusSchema),
  asyncHandler(async (req, res) => {
    const athlete = await runOrNotFound(
      prisma.athlete.update({ where: { id: req.params.id }, data: req.body }),
      'Atleta não encontrado.',
    )
    res.json(athlete)
  }),
)

athletesAdminRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await runOrNotFound(prisma.athlete.delete({ where: { id: req.params.id } }), 'Atleta não encontrado.')
    res.status(204).send()
  }),
)

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { validateBody } from '../middleware/validate'
import { publicWriteLimiter } from '../middleware/rateLimit'

// Endpoint público usado pelo formulário de Inscrição do site.
export const registrationsRouter = Router()

const registrationSchema = z.object({
  fullName: z.string().min(1, 'O nome completo é obrigatório.'),
  birthDate: z.coerce.date({ errorMap: () => ({ message: 'Data de nascimento inválida.' }) }),
  gender: z.string().min(1, 'O género é obrigatório.'),
  phone: z.string().min(1, 'O contacto telefónico é obrigatório.'),
  email: z.string().email('Email inválido.'),
  clubName: z.string().optional(),
  categoryId: z.string().min(1, 'A categoria é obrigatória.'),
  competitionId: z.string().min(1, 'Escolha a competição em que se vai inscrever.'),
  sportIds: z
    .array(z.string().min(1))
    .min(1, 'Escolha pelo menos uma modalidade.')
    .max(2, 'Cada atleta pode inscrever-se em no máximo duas modalidades.'),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'É necessário aceitar o regulamento para se inscrever.' }),
  }),
})

registrationsRouter.post(
  '/',
  publicWriteLimiter,
  validateBody(registrationSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof registrationSchema>

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
    if (!category) {
      throw ApiError.badRequest('Categoria selecionada não existe.')
    }

    const competition = await prisma.competition.findUnique({ where: { id: data.competitionId } })
    if (!competition) {
      throw ApiError.badRequest('Competição selecionada não existe.')
    }
    if (competition.status !== 'scheduled') {
      throw ApiError.badRequest('Esta competição já não está a aceitar inscrições.')
    }

    const sports = await prisma.sport.findMany({ where: { id: { in: data.sportIds } } })
    if (sports.length !== data.sportIds.length) {
      throw ApiError.badRequest('Uma ou mais modalidades selecionadas não existem.')
    }

    const athlete = await prisma.athlete.create({
      data: {
        fullName: data.fullName,
        birthDate: data.birthDate,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        clubName: data.clubName,
        categoryId: data.categoryId,
        competitionId: data.competitionId,
        acceptedTerms: data.acceptedTerms,
        status: 'pending',
        sports: { create: data.sportIds.map((sportId) => ({ sportId })) },
      },
      include: { category: true, competition: true, sports: { include: { sport: true } } },
    })

    res.status(201).json({
      message: 'Inscrição recebida com sucesso. A APSKIB irá validar os seus dados em breve.',
      athlete,
    })
  }),
)

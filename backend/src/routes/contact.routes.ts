import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { runOrNotFound } from '../utils/prismaHelpers'
import { validateBody } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'
import { publicWriteLimiter } from '../middleware/rateLimit'

// POST /api/contact — público, usado pelo formulário de Contactos do site.
export const contactRouter = Router()

// /api/admin/contact — apenas para a APSKIB consultar as mensagens recebidas.
export const contactAdminRouter = Router()

const contactSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('Email inválido.'),
  subject: z.string().optional(),
  message: z.string().min(1, 'A mensagem não pode ficar vazia.'),
})

contactRouter.post(
  '/',
  publicWriteLimiter,
  validateBody(contactSchema),
  asyncHandler(async (req, res) => {
    const contactMessage = await prisma.contactMessage.create({ data: req.body })
    res.status(201).json({
      message: 'Mensagem enviada com sucesso. Entraremos em contacto em breve.',
      id: contactMessage.id,
    })
  }),
)

contactAdminRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const unreadOnly = req.query.unread === 'true'

    const messages = await prisma.contactMessage.findMany({
      where: unreadOnly ? { read: false } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    res.json(messages)
  }),
)

contactAdminRouter.patch(
  '/:id/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const contactMessage = await runOrNotFound(
      prisma.contactMessage.update({ where: { id: req.params.id }, data: { read: true } }),
      'Mensagem não encontrada.',
    )
    res.json(contactMessage)
  }),
)

contactAdminRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await runOrNotFound(prisma.contactMessage.delete({ where: { id: req.params.id } }), 'Mensagem não encontrada.')
    res.status(204).send()
  }),
)

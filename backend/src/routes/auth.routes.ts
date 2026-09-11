import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { validateBody } from '../middleware/validate'
import { requireAuth, signAuthToken } from '../middleware/auth'
import { loginLimiter } from '../middleware/rateLimit'

export const authRouter = Router()

const loginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(1, 'Password obrigatória.'),
})

authRouter.post(
  '/login',
  loginLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>

    const admin = await prisma.adminUser.findUnique({ where: { email } })

    if (!admin) {
      throw ApiError.unauthorized('Email ou password incorretos.')
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash)

    if (!passwordMatches) {
      throw ApiError.unauthorized('Email ou password incorretos.')
    }

    const token = signAuthToken({ sub: admin.id, email: admin.email, role: admin.role })

    res.json({
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    })
  }),
)

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.sub } })

    if (!admin) {
      throw ApiError.unauthorized('Conta não encontrada.')
    }

    res.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role })
  }),
)

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Introduza a password atual.'),
  newPassword: z.string().min(8, 'A nova password deve ter pelo menos 8 caracteres.'),
})

authRouter.patch(
  '/password',
  requireAuth,
  loginLimiter,
  validateBody(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>

    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.sub } })

    if (!admin) {
      throw ApiError.unauthorized('Conta não encontrada.')
    }

    const passwordMatches = await bcrypt.compare(currentPassword, admin.passwordHash)

    if (!passwordMatches) {
      throw ApiError.unauthorized('Password atual incorreta.')
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash } })

    res.json({ message: 'Password atualizada com sucesso.' })
  }),
)

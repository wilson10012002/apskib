import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../env'
import { ApiError } from '../utils/apiError'

export interface AuthPayload {
  sub: string
  email: string
  role: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AuthPayload
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    next(ApiError.unauthorized('Sessão em falta. Faça login para continuar.'))
    return
  }

  const token = header.slice('Bearer '.length).trim()

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload
    req.admin = payload
    next()
  } catch {
    next(ApiError.unauthorized('Sessão inválida ou expirada. Faça login novamente.'))
  }
}

export function signAuthToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] })
}

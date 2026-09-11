import type { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import multer from 'multer'
import { ApiError } from '../utils/apiError'
import { isProduction } from '../env'

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    },
  })
}

// O parâmetro `req` não é usado aqui, mas o Express só reconhece esta
// função como middleware de erro (4 argumentos) se ele estiver presente.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: { message: err.message, details: err.details },
    })
    return
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        error: { message: 'Já existe um registo com esses dados (valor duplicado).' },
      })
      return
    }

    if (err.code === 'P2025') {
      res.status(404).json({ error: { message: 'Registo não encontrado.' } })
      return
    }
  }

  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: { message: `Erro no upload do ficheiro: ${err.message}` } })
    return
  }

  // Erro não previsto: regista no servidor e devolve uma mensagem genérica
  // (nunca expor detalhes internos ao cliente em produção).
  console.error('Erro não tratado:', err)

  res.status(500).json({
    error: {
      message: 'Erro interno do servidor.',
      ...(isProduction ? {} : { detail: err instanceof Error ? err.message : String(err) }),
    },
  })
}

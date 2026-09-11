import type { NextFunction, Request, Response } from 'express'
import type { ZodTypeAny } from 'zod'
import { ApiError } from '../utils/apiError'

// Valida req.body contra um schema Zod. Em caso de sucesso, substitui
// req.body pelos dados já convertidos/limpos (ex: strings -> Date).
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      next(ApiError.badRequest('Dados inválidos.', result.error.flatten()))
      return
    }

    req.body = result.data
    next()
  }
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      next(ApiError.badRequest('Parâmetros de pesquisa inválidos.', result.error.flatten()))
      return
    }

    // Express tipa req.query como ParsedQs; depois de validado com Zod
    // guardamos o resultado já convertido (ex: strings -> números).
    ;(req as unknown as { query: unknown }).query = result.data
    next()
  }
}

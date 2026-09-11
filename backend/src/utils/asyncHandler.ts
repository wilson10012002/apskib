import type { NextFunction, Request, RequestHandler, Response } from 'express'

// Envolve um handler assíncrono e encaminha qualquer erro para o
// errorHandler do Express, evitando try/catch repetido em cada rota.
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

import { Prisma } from '@prisma/client'
import { ApiError } from './apiError'

// Executa uma operação do Prisma (ex: update/delete por id) e converte o
// erro "registo não encontrado" (P2025) do Prisma num ApiError 404
// amigável. Qualquer outro erro é reencaminhado tal como veio, para o
// errorHandler geral o tratar (ex: violação de unicidade).
export async function runOrNotFound<T>(operation: Promise<T>, message = 'Registo não encontrado.'): Promise<T> {
  try {
    return await operation
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw ApiError.notFound(message)
    }
    throw error
  }
}

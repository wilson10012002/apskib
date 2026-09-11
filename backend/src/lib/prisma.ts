import { PrismaClient } from '@prisma/client'
import { isProduction } from '../env'

// Evita criar várias instâncias do PrismaClient durante o hot-reload em
// desenvolvimento (o tsx watch reinicia o módulo mas não o processo Node).
declare global {
  var __prisma__: PrismaClient | undefined
}

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: isProduction ? ['error', 'warn'] : ['error', 'warn'],
  })

if (!isProduction) {
  global.__prisma__ = prisma
}

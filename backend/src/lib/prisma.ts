import { PrismaClient } from '@prisma/client'

// Reutiliza a mesma instância do PrismaClient em vez de criar uma nova a
// cada import — tanto em desenvolvimento (o tsx watch reinicia o módulo mas
// não o processo Node) como em produção no Vercel (uma função serverless
// "quente" pode tratar vários pedidos seguidos; sem isto, cada pedido podia
// abrir uma ligação nova à base de dados e esgotar o limite de ligações).
declare global {
  var __prisma__: PrismaClient | undefined
}

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

global.__prisma__ = prisma

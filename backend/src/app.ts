import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { env, isProduction } from './env'
import { apiRouter } from './routes'
import { notFoundHandler, errorHandler } from './middleware/errorHandler'

// Endereços de rede local (Wi-Fi/LAN) usados para testes a partir de outro
// dispositivo (telemóvel, outro computador) durante o desenvolvimento —
// evita ter de atualizar CORS_ORIGIN manualmente sempre que o IP muda.
const LOCAL_NETWORK_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/

function buildCorsOriginCheck() {
  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Pedidos sem cabeçalho Origin (ex: curl, apps móveis, Postman) — permitir.
    if (!origin) {
      callback(null, true)
      return
    }

    if (env.corsOrigin.includes(origin)) {
      callback(null, true)
      return
    }

    // Fora de produção, aceita qualquer origem de rede local, para poder
    // testar o site a partir de outro dispositivo na mesma rede.
    if (!isProduction && LOCAL_NETWORK_ORIGIN.test(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Não permitido por CORS.'))
  }
}

export function createApp() {
  const app = express()

  app.disable('x-powered-by')

  // Ficheiros carregados (imagens/documentos) só via HTTP simples, não via
  // <script>, e sem herdar a política de referrer da API.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )

  app.use(
    cors({
      origin: buildCorsOriginCheck(),
      credentials: true,
    }),
  )

  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))

  if (!isProduction) {
    app.use(morgan('dev'))
  }

  // Os ficheiros carregados (documentos, imagens da galeria, logótipos)
  // ficam no Vercel Blob (ver middleware/upload.ts), não em disco local —
  // por isso já não há aqui nenhuma pasta /uploads estática para servir.
  app.use('/api', apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

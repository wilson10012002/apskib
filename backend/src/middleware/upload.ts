import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import multer from 'multer'
import { env } from '../env'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true })
}

function makeStorage(subfolder: string) {
  const dir = path.join(process.cwd(), env.uploadDir, subfolder)
  ensureDir(dir)

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const unique = crypto.randomBytes(8).toString('hex')
      const extension = path.extname(file.originalname).toLowerCase()
      cb(null, `${Date.now()}-${unique}${extension}`)
    },
  })
}

// Upload de imagens (galeria, logótipos de clubes/parceiros, capas de notícias)
export const uploadImage = multer({
  storage: makeStorage('images'),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    if (!IMAGE_TYPES.includes(file.mimetype)) {
      cb(new Error('Formato de imagem não suportado. Use JPEG, PNG ou WebP.'))
      return
    }
    cb(null, true)
  },
})

// Upload de documentos (estatutos, regulamentos, fichas)
export const uploadDocument = multer({
  storage: makeStorage('documents'),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    if (!DOCUMENT_TYPES.includes(file.mimetype)) {
      cb(new Error('Formato de documento não suportado. Use PDF ou Word.'))
      return
    }
    cb(null, true)
  },
})

export function publicUrlFor(req: { protocol: string; get: (name: string) => string | undefined }, relativePath: string) {
  const host = req.get('host')
  return `${req.protocol}://${host}/uploads/${relativePath}`
}

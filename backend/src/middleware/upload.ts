import crypto from 'node:crypto'
import multer from 'multer'
import { put } from '@vercel/blob'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

// Em serverless (Vercel) não há disco persistente entre pedidos, por isso os
// ficheiros ficam apenas em memória durante o pedido (multer.memoryStorage)
// e são depois enviados para o Vercel Blob em uploadBufferToBlob — nunca
// gravados localmente.
const memoryStorage = multer.memoryStorage()

// Upload de imagens (galeria, logótipos de parceiros, capas de notícias)
export const uploadImage = multer({
  storage: memoryStorage,
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
  storage: memoryStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    if (!DOCUMENT_TYPES.includes(file.mimetype)) {
      cb(new Error('Formato de documento não suportado. Use PDF ou Word.'))
      return
    }
    cb(null, true)
  },
})

// Envia um ficheiro já recebido pelo multer (em memória) para o Vercel Blob
// e devolve o URL público definitivo. `subfolder` organiza os ficheiros por
// tipo (images/documents) dentro do Blob store. Requer a variável de
// ambiente BLOB_READ_WRITE_TOKEN (criada automaticamente ao ligar um Vercel
// Blob store ao projeto).
export async function uploadBufferToBlob(
  subfolder: 'images' | 'documents',
  file: Express.Multer.File,
): Promise<string> {
  const unique = crypto.randomBytes(8).toString('hex')
  const extension = file.originalname.includes('.') ? file.originalname.split('.').pop() : undefined
  const pathname = `${subfolder}/${Date.now()}-${unique}${extension ? `.${extension}` : ''}`

  const blob = await put(pathname, file.buffer, {
    access: 'public',
    contentType: file.mimetype,
  })

  return blob.url
}

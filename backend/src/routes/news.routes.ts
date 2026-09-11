import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { runOrNotFound } from '../utils/prismaHelpers'
import { validateBody } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'

export const newsRouter = Router()
export const newsAdminRouter = Router()

function slugify(value: string): string {
  const withoutAccents = value
    .normalize('NFD')
    .split('')
    .filter((char) => {
      const code = char.charCodeAt(0)
      // Remove marcas diacríticas combinadas (ex: acentos separados pelo NFD)
      return !(code >= 0x0300 && code <= 0x036f)
    })
    .join('')

  return withoutAccents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

const newsSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  published: z.boolean().default(false),
})

newsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const posts = await prisma.newsPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    })
    res.json(posts)
  }),
)

newsRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const post = await prisma.newsPost.findUnique({ where: { slug: req.params.slug } })

    if (!post || !post.published) {
      throw ApiError.notFound('Notícia não encontrada.')
    }

    res.json(post)
  }),
)

newsAdminRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const posts = await prisma.newsPost.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(posts)
  }),
)

newsAdminRouter.post(
  '/',
  requireAuth,
  validateBody(newsSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof newsSchema>
    const slug = data.slug ? slugify(data.slug) : slugify(data.title)

    const post = await prisma.newsPost.create({
      data: {
        ...data,
        slug,
        publishedAt: data.published ? new Date() : null,
      },
    })

    res.status(201).json(post)
  }),
)

newsAdminRouter.put(
  '/:id',
  requireAuth,
  validateBody(newsSchema.partial()),
  asyncHandler(async (req, res) => {
    const data = req.body as Partial<z.infer<typeof newsSchema>>

    const existing = await prisma.newsPost.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      throw ApiError.notFound('Notícia não encontrada.')
    }

    const willPublishNow = data.published && !existing.published

    const post = await runOrNotFound(
      prisma.newsPost.update({
        where: { id: req.params.id },
        data: {
          ...data,
          ...(data.slug ? { slug: slugify(data.slug) } : {}),
          ...(willPublishNow ? { publishedAt: new Date() } : {}),
        },
      }),
      'Notícia não encontrada.',
    )

    res.json(post)
  }),
)

newsAdminRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await runOrNotFound(prisma.newsPost.delete({ where: { id: req.params.id } }), 'Notícia não encontrada.')
    res.status(204).send()
  }),
)

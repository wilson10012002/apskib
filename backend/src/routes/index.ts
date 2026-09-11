import { Router } from 'express'

import { authRouter } from './auth.routes'
import { sportsRouter } from './sports.routes'
import { categoriesRouter } from './categories.routes'
import { clubsRouter, clubsAdminRouter } from './clubs.routes'
import { athletesRouter, athletesAdminRouter } from './athletes.routes'
import { registrationsRouter } from './registrations.routes'
import { competitionsRouter } from './competitions.routes'
import { resultsRouter } from './results.routes'
import { rankingRouter } from './ranking.routes'
import { newsRouter, newsAdminRouter } from './news.routes'
import { partnersRouter } from './partners.routes'
import { documentsRouter } from './documents.routes'
import { galleryRouter } from './gallery.routes'
import { contactRouter, contactAdminRouter } from './contact.routes'

export const apiRouter = Router()

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ---- Rotas públicas -----------------------------------------------------
apiRouter.use('/auth', authRouter)
apiRouter.use('/sports', sportsRouter)
apiRouter.use('/categories', categoriesRouter)
apiRouter.use('/clubs', clubsRouter)
apiRouter.use('/athletes', athletesRouter)
apiRouter.use('/registrations', registrationsRouter)
apiRouter.use('/competitions', competitionsRouter)
apiRouter.use('/results', resultsRouter)
apiRouter.use('/ranking', rankingRouter)
apiRouter.use('/news', newsRouter)
apiRouter.use('/partners', partnersRouter)
apiRouter.use('/documents', documentsRouter)
apiRouter.use('/gallery', galleryRouter)
apiRouter.use('/contact', contactRouter)

// ---- Rotas de administração (todas exigem token JWT válido) ------------
apiRouter.use('/admin/clubs', clubsAdminRouter)
apiRouter.use('/admin/athletes', athletesAdminRouter)
apiRouter.use('/admin/news', newsAdminRouter)
apiRouter.use('/admin/contact', contactAdminRouter)

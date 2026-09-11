import rateLimit from 'express-rate-limit'

// Protege endpoints públicos de escrita (login, contacto, inscrições)
// contra spam e tentativas de força bruta.
export const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { message: 'Demasiados pedidos. Tente novamente dentro de alguns minutos.' },
  },
})

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { message: 'Demasiadas tentativas de login. Tente novamente dentro de alguns minutos.' },
  },
})

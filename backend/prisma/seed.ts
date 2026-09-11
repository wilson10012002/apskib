import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('A semear dados iniciais da APSKIB...')

  // ---------------------------------------------------------------------
  // Modalidades (mesmos dados que já existiam no frontend)
  // ---------------------------------------------------------------------
  const sports = [
    {
      slug: 'sambo-combate',
      name: 'Sambo Combate',
      color: 'red' as const,
      description:
        'Vertente competitiva do Sambo focada no combate e nas técnicas de luta.',
      rules: [
        'Combina técnicas de luta agarrada com golpes controlados, conforme o regulamento da modalidade.',
        'As decisões são atribuídas por pontuação técnica, submissão ou paragem do árbitro.',
        'Equipamento obrigatório: keikogi de sambo e proteções homologadas.',
      ],
      order: 1,
    },
    {
      slug: 'sambo-desportivo',
      name: 'Sambo Desportivo',
      color: 'blue' as const,
      description:
        'Vertente competitiva do Sambo baseada na aplicação técnica e desportiva.',
      rules: [
        'Foco em projeções, imobilizações e chaves de submissão.',
        'Não são permitidos golpes — a pontuação avalia técnica e controlo.',
        'Equipamento obrigatório: keikogi de sambo.',
      ],
      order: 2,
    },
    {
      slug: 'kurash',
      name: 'Kurash',
      color: 'green' as const,
      description:
        'Modalidade tradicional de luta caracterizada pelas técnicas de projeção.',
      rules: [
        'Combate em pé, com o objetivo de projetar o adversário de forma controlada.',
        'Não são permitidas técnicas de imobilização ou submissão prolongadas no solo.',
        'Equipamento obrigatório: kurashovka (uniforme tradicional).',
      ],
      order: 3,
    },
  ]

  for (const sport of sports) {
    await prisma.sport.upsert({
      where: { slug: sport.slug },
      update: sport,
      create: sport,
    })
  }

  // ---------------------------------------------------------------------
  // Categorias etárias
  // ---------------------------------------------------------------------
  const categories = [
    { slug: 'mirins', label: 'Mirins', ageRange: '8–11 anos', order: 1 },
    { slug: 'infantil', label: 'Infantil', ageRange: '12–13 anos', order: 2 },
    { slug: 'juvenis', label: 'Juvenis', ageRange: '14–15 anos', order: 3 },
    { slug: 'juniores', label: 'Júniores', ageRange: '16–18 anos', order: 4 },
    { slug: 'seniores', label: 'Seniores', ageRange: '19–34 anos', order: 5 },
    { slug: 'masters', label: 'Masters', ageRange: '35+ anos', order: 6 },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }

  // ---------------------------------------------------------------------
  // Competição inicial (a mesma já anunciada no site)
  // ---------------------------------------------------------------------
  const existingCompetition = await prisma.competition.findFirst({
    where: { title: 'I Campeonato Provincial de Sambo e Kurash' },
  })

  if (!existingCompetition) {
    await prisma.competition.create({
      data: {
        title: 'I Campeonato Provincial de Sambo e Kurash',
        date: '12–13 Setembro 2026',
        location: 'Icolo e Bengo',
        categoryLabel: 'Campeonato Provincial',
        status: 'scheduled',
      },
    })
  }

  // ---------------------------------------------------------------------
  // Conta de administrador inicial
  // ---------------------------------------------------------------------
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? 'admin@apskib.ao'
  const adminName = process.env.ADMIN_SEED_NAME ?? 'Administrador APSKIB'
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? 'MudeEstaPassword123!'

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12)

    await prisma.adminUser.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
      },
    })

    console.log(`Conta de administrador criada: ${adminEmail}`)
    console.log('Mude a password assim que fizer login pela primeira vez.')
  } else {
    console.log(`Conta de administrador já existia: ${adminEmail}`)
  }

  console.log('Seed concluído.')
}

main()
  .catch((error) => {
    console.error('Falha ao semear a base de dados:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

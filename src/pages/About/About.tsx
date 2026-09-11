import { Target, Eye, HeartHandshake, Users, Trophy, CalendarDays } from 'lucide-react'
import PageHero from '../../components/common/PageHero/PageHero'
import { useFetch } from '../../hooks/useFetch'
import { sportsApi, categoriesApi } from '../../lib/api'

const values = [
  {
    icon: Target,
    title: 'Missão',
    text: 'Promover, organizar e desenvolver o Sambo e o Kurash na província do Icolo e Bengo, formando atletas com disciplina e organização.',
  },
  {
    icon: Eye,
    title: 'Visão',
    text: 'Ser a referência provincial na formação de atletas de Sambo e Kurash, contribuindo para o desenvolvimento do desporto a nível nacional.',
  },
  {
    icon: HeartHandshake,
    title: 'Valores',
    text: 'Disciplina, organização, respeito, espírito desportivo e compromisso com o resultado — dentro e fora do tapete.',
  },
]

const board = [
  { role: 'Presidente', name: 'A designar' },
  { role: 'Vice-Presidente', name: 'A designar' },
  { role: 'Secretário-Geral', name: 'A designar' },
  { role: 'Diretor Técnico', name: 'A designar' },
]

export default function About() {
  const { data: sports } = useFetch(sportsApi.list, [])
  const { data: categories } = useFetch(categoriesApi.list, [])

  const stats = [
    { icon: Trophy, value: sports ? String(sports.length) : '—', label: 'Modalidades' },
    { icon: Users, value: categories ? String(categories.length) : '—', label: 'Categorias etárias' },
    { icon: CalendarDays, value: '1', label: 'Campeonato provincial' },
  ]

  return (
    <>
      <PageHero
        title="Sobre a APSKIB"
        description="Associação Provincial de Sambo e Kurash do Icolo e Bengo."
      />

      <section className="page-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-label">Quem somos</span>

            <h2>Disciplina, organização e resultado</h2>

            <p>
              A APSKIB é a associação responsável por organizar, promover e
              desenvolver o Sambo e o Kurash na província do Icolo e Bengo,
              reunindo clubes, atletas, treinadores e árbitros em torno de um
              único campeonato provincial.
            </p>
          </div>

          <div className="stats-row">
            {stats.map(({ icon: Icon, value, label }) => (
              <div className="stat-item" key={label}>
                <Icon size={26} />
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section alt">
        <div className="section-container">
          <div className="info-grid three">
            {values.map(({ icon: Icon, title, text }) => (
              <div className="info-card" key={title}>
                <div className="icon-badge">
                  <Icon size={22} />
                </div>

                <h3>{title}</h3>

                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-label">Governação</span>

            <h2>Órgãos Sociais</h2>

            <p>Composição da direção da APSKIB para o presente mandato.</p>
          </div>

          <div className="info-grid four compact">
            {board.map((member) => (
              <div className="info-card compact" key={member.role}>
                <span className="board-role">{member.role}</span>
                <strong>{member.name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

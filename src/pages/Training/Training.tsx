import { GraduationCap, Gavel, Users2 } from 'lucide-react'
import PageHero from '../../components/common/PageHero/PageHero'
import { contactInfo } from '../../data/content'

const programs = [
  {
    icon: Users2,
    title: 'Formação de Atletas',
    text: 'Treino técnico e tático nas modalidades de Sambo e Kurash, organizado por categoria etária.',
  },
  {
    icon: GraduationCap,
    title: 'Formação de Treinadores',
    text: 'Capacitação técnica para treinadores dos clubes afiliados, com foco em metodologia de ensino.',
  },
  {
    icon: Gavel,
    title: 'Formação de Árbitros',
    text: 'Preparação de árbitros para garantir competições justas e conformes ao regulamento.',
  },
]

export default function Training() {
  return (
    <>
      <PageHero
        title="Formação"
        description="Programas de formação para atletas, treinadores e árbitros."
      />

      <section className="page-section">
        <div className="section-container">
          <div className="info-grid three">
            {programs.map(({ icon: Icon, title, text }) => (
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

      <section className="page-section alt">
        <div className="section-container">
          <div className="empty-state">
            <span>APSKIB</span>
            <h2>Calendário de formações em breve</h2>
            <p>
              As datas e locais das próximas ações de formação serão
              publicados aqui. Para mais informações, contacte a APSKIB em{' '}
              <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

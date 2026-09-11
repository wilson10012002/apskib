import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Tag } from 'lucide-react'
import type { ApiCompetition } from '../../../types/api'

interface UpcomingCompetitionsProps {
  competitions: ApiCompetition[] | null
  loading: boolean
  error: string | null
}

export default function UpcomingCompetitions({ competitions, loading, error }: UpcomingCompetitionsProps) {
  return (
    <section className="page-section alt">
      <div className="section-container">
        <div className="section-header">
          <span className="section-label">APSKIB</span>

          <h2>Próximas Competições</h2>

          <p>
            Consulte aqui as próximas competições de Sambo e Kurash
            organizadas pela APSKIB.
          </p>
        </div>

        {loading && <p className="state-message">A carregar competições…</p>}

        {!loading && error && <p className="state-message error">{error}</p>}

        {!loading && !error && competitions && competitions.length > 0 && (
          <div className="info-grid three">
            {competitions.map((competition) => (
              <article className="competition-card" key={competition.id}>
                <span
                  className={`status-badge ${
                    competition.status === 'completed' ? 'done' : 'scheduled'
                  }`}
                >
                  {competition.status === 'completed' ? 'Concluído' : 'Agendado'}
                </span>

                <h3>{competition.title}</h3>

                <ul className="competition-meta">
                  <li>
                    <CalendarDays size={16} />
                    {competition.date}
                  </li>

                  <li>
                    <MapPin size={16} />
                    {competition.location}
                  </li>

                  <li>
                    <Tag size={16} />
                    {competition.categoryLabel}
                  </li>
                </ul>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && competitions && competitions.length === 0 && (
          <div className="empty-state">
            <span>APSKIB</span>
            <h2>Sem competições agendadas</h2>
            <p>Em breve poderá consultar aqui novas competições.</p>
          </div>
        )}

        <div className="section-cta">
          <Link to="/competicoes" className="hero-button primary inline-button">
            Ver todas as competições
          </Link>
        </div>
      </div>
    </section>
  )
}

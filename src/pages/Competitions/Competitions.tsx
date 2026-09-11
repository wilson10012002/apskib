import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Tag } from 'lucide-react'
import PageHero from '../../components/common/PageHero/PageHero'
import { useFetch } from '../../hooks/useFetch'
import { competitionsApi } from '../../lib/api'

export default function Competitions() {
  const { data: competitions, loading, error } = useFetch(competitionsApi.list, [])

  return (
    <>
      <PageHero
        title="Competições"
        description="Calendário de competições organizadas pela APSKIB."
      />

      <section className="page-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-label">Calendário</span>

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
        </div>
      </section>

      <section className="page-section alt">
        <div className="section-container">
          <div className="info-grid two">
            <div className="info-card">
              <h3>Como funciona</h3>

              <p>
                As competições da APSKIB estão organizadas por modalidade
                (Sambo Combate, Sambo Desportivo e Kurash) e por categoria
                etária. Cada atleta compete dentro da sua categoria e
                modalidade inscrita.
              </p>
            </div>

            <div className="info-card">
              <h3>Quer participar?</h3>

              <p>
                Garanta a sua vaga inscrevendo-se com antecedência através do
                formulário de inscrição.
              </p>

              <Link to="/inscricao" className="hero-button primary inline-button">
                Inscreva-se
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

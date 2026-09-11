import { Link } from 'react-router-dom'
import { UserPlus, ShieldCheck, ClipboardList, Users } from 'lucide-react'
import PageHero from '../../components/common/PageHero/PageHero'
import { useFetch } from '../../hooks/useFetch'
import { athletesApi } from '../../lib/api'

const steps = [
  {
    icon: ClipboardList,
    title: '1. Preencha a inscrição',
    text: 'Submeta o formulário de inscrição com os seus dados e a modalidade pretendida.',
  },
  {
    icon: ShieldCheck,
    title: '2. Validação',
    text: 'A APSKIB valida os dados e associa o atleta ao clube indicado (ou como atleta independente).',
  },
  {
    icon: UserPlus,
    title: '3. Atleta federado',
    text: 'Após validação, o atleta fica apto a participar nas competições oficiais da APSKIB.',
  },
]

export default function Athletes() {
  const { data: athletes, loading, error } = useFetch(athletesApi.list, [])

  return (
    <>
      <PageHero
        title="Atletas"
        description="Atletas federados nas modalidades de Sambo e Kurash do Icolo e Bengo."
      />

      <section className="page-section">
        <div className="section-container">
          {loading && <p className="state-message">A carregar atletas…</p>}

          {!loading && error && <p className="state-message error">{error}</p>}

          {!loading && !error && athletes && athletes.length > 0 && (
            <div className="info-grid three">
              {athletes.map((athlete) => (
                <div className="info-card" key={athlete.id}>
                  <h3>{athlete.fullName}</h3>
                  <p>{athlete.club ?? 'Atleta independente'}</p>
                  {athlete.category && <p>{athlete.category}</p>}
                  {athlete.sports.length > 0 && (
                    <p>{athlete.sports.map((sport) => sport.name).join(' + ')}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && !error && athletes && athletes.length === 0 && (
            <div className="empty-state">
              <div className="icon-badge large">
                <Users size={28} />
              </div>

              <span>APSKIB</span>
              <h2>Lista de atletas em atualização</h2>
              <p>
                Estamos a preparar o registo público de atletas federados.
                Em breve poderá consultar aqui os atletas de cada clube e
                categoria.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="page-section alt">
        <div className="section-container">
          <div className="section-header">
            <span className="section-label">Federação</span>
            <h2>Como tornar-se atleta federado</h2>
          </div>

          <div className="info-grid three">
            {steps.map(({ icon: Icon, title, text }) => (
              <div className="info-card" key={title}>
                <div className="icon-badge">
                  <Icon size={22} />
                </div>

                <h3>{title}</h3>

                <p>{text}</p>
              </div>
            ))}
          </div>

          <div className="section-cta">
            <Link to="/inscricao" className="hero-button primary">
              Inscreva-se agora
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

import { Building2, FileCheck2, Send } from 'lucide-react'
import PageHero from '../../components/common/PageHero/PageHero'
import { useFetch } from '../../hooks/useFetch'
import { clubsApi } from '../../lib/api'
import { contactInfo } from '../../data/content'

const steps = [
  {
    icon: FileCheck2,
    title: '1. Reúna os documentos',
    text: 'Estatutos do clube, lista de atletas e identificação dos responsáveis técnicos.',
  },
  {
    icon: Building2,
    title: '2. Submeta o pedido',
    text: 'Envie os documentos para a APSKIB através dos contactos oficiais.',
  },
  {
    icon: Send,
    title: '3. Confirmação',
    text: 'Após análise, o clube é confirmado como afiliado e pode inscrever atletas.',
  },
]

export default function Clubs() {
  const { data: clubs, loading, error } = useFetch(clubsApi.list, [])

  return (
    <>
      <PageHero
        title="Clubes"
        description="Clubes afiliados à APSKIB nas modalidades de Sambo e Kurash."
      />

      <section className="page-section">
        <div className="section-container">
          {loading && <p className="state-message">A carregar clubes…</p>}

          {!loading && error && <p className="state-message error">{error}</p>}

          {!loading && !error && clubs && clubs.length > 0 && (
            <div className="info-grid three">
              {clubs.map((club) => (
                <div className="info-card" key={club.id}>
                  <h3>{club.name}</h3>
                  {club.city && <p>{club.city}</p>}
                </div>
              ))}
            </div>
          )}

          {!loading && !error && clubs && clubs.length === 0 && (
            <div className="empty-state">
              <div className="icon-badge large">
                <Building2 size={28} />
              </div>

              <span>APSKIB</span>
              <h2>Lista de clubes em atualização</h2>
              <p>Em breve poderá consultar aqui todos os clubes afiliados à APSKIB.</p>
            </div>
          )}
        </div>
      </section>

      <section className="page-section alt">
        <div className="section-container">
          <div className="section-header">
            <span className="section-label">Afiliação</span>
            <h2>Como afiliar o seu clube</h2>
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
            <a
              href={`mailto:${contactInfo.email}?subject=${encodeURIComponent('Afiliação de clube - APSKIB')}`}
              className="hero-button primary"
            >
              Contactar para afiliação
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

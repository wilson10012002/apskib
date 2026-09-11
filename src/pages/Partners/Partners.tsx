import { Handshake } from 'lucide-react'
import PageHero from '../../components/common/PageHero/PageHero'
import { useFetch } from '../../hooks/useFetch'
import { partnersApi } from '../../lib/api'
import { contactInfo } from '../../data/content'

export default function Partners() {
  const { data: partners, loading, error } = useFetch(partnersApi.list, [])

  return (
    <>
      <PageHero
        title="Parceiros"
        description="Entidades que apoiam o desenvolvimento do Sambo e do Kurash no Icolo e Bengo."
      />

      <section className="page-section">
        <div className="section-container">
          {loading && <p className="state-message">A carregar parceiros…</p>}

          {!loading && error && <p className="state-message error">{error}</p>}

          {!loading && !error && partners && partners.length > 0 && (
            <div className="info-grid three">
              {partners.map((partner) => {
                const content = (
                  <div className="info-card compact" key={partner.id}>
                    {partner.logoUrl && (
                      <div className="partner-logo">
                        <img src={partner.logoUrl} alt={partner.name} />
                      </div>
                    )}
                    <strong>{partner.name}</strong>
                  </div>
                )

                return partner.website ? (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noreferrer"
                    key={partner.id}
                    className="partner-link"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )
              })}
            </div>
          )}

          {!loading && !error && partners && partners.length === 0 && (
            <div className="empty-state">
              <div className="icon-badge large">
                <Handshake size={28} />
              </div>

              <span>APSKIB</span>
              <h2>Ainda sem parceiros divulgados</h2>
              <p>
                A APSKIB está a construir parcerias institucionais e
                patrocínios. Em breve os nossos parceiros serão apresentados
                aqui.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="page-section alt">
        <div className="section-container">
          <div className="info-card centered">
            <h3>Torne-se parceiro da APSKIB</h3>

            <p>
              Se a sua empresa ou instituição pretende apoiar o Sambo e o
              Kurash no Icolo e Bengo, entre em contacto connosco.
            </p>

            <a
              href={`mailto:${contactInfo.email}?subject=${encodeURIComponent('Proposta de parceria - APSKIB')}`}
              className="hero-button primary inline-button"
            >
              Quero ser parceiro
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

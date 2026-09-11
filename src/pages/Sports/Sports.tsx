import PageHero from '../../components/common/PageHero/PageHero'
import { useFetch } from '../../hooks/useFetch'
import { sportsApi, categoriesApi } from '../../lib/api'

export default function Sports() {
  const { data: sports, loading: loadingSports, error: sportsError } = useFetch(sportsApi.list, [])
  const { data: categories, loading: loadingCategories, error: categoriesError } = useFetch(
    categoriesApi.list,
    [],
  )

  const loading = loadingSports || loadingCategories
  const error = sportsError ?? categoriesError

  return (
    <>
      <PageHero
        eyebrow="Campeonato APSKIB"
        title="Modalidades"
        description="Sambo Combate, Sambo Desportivo e Kurash — regras gerais e categorias etárias."
      />

      {loading && (
        <section className="page-section">
          <div className="section-container">
            <p className="state-message">A carregar modalidades…</p>
          </div>
        </section>
      )}

      {!loading && error && (
        <section className="page-section">
          <div className="section-container">
            <p className="state-message error">{error}</p>
          </div>
        </section>
      )}

      {!loading && !error && sports && (
        <section className="page-section">
          <div className="section-container">
            <div className="sports-grid">
              {sports.map((sport) => (
                <article className={`sport-card ${sport.color}`} key={sport.id}>
                  <div className="sport-card-line" />

                  <div className="sport-card-content">
                    <span className="sport-type">Modalidade competitiva</span>

                    <h3>{sport.name}</h3>

                    <p>{sport.description}</p>

                    <ul className="sport-rules">
                      {sport.rules.map((rule) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>

            <div className="registration-notice">
              <div className="notice-content">
                <span className="notice-label">Atenção</span>

                <h3>Regra de inscrição nas modalidades</h3>

                <p>
                  Cada atleta poderá inscrever-se em
                  <strong> apenas duas modalidades </strong>
                  neste campeonato.
                </p>

                <p>
                  O atleta deverá escolher
                  <strong> uma modalidade de Sambo </strong>
                  — Sambo Combate ou Sambo Desportivo —
                  e poderá participar também no
                  <strong> Kurash</strong>.
                </p>

                <p className="notice-example">
                  Exemplo: Sambo Combate + Kurash ou Sambo Desportivo + Kurash.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {!loading && !error && categories && (
        <section className="page-section alt">
          <div className="section-container">
            <div className="categories-header">
              <span className="section-label">Faixas etárias</span>
              <h3>Categorias</h3>
              <p className="categories-note">
                Intervalos indicativos — consulte o regulamento oficial da
                APSKIB para as faixas etárias exatas de cada época.
              </p>
            </div>

            <div className="categories-grid">
              {categories.map((category, index) => (
                <div className="category-card" key={category.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>

                  <strong>{category.label}</strong>

                  <em>{category.ageRange}</em>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

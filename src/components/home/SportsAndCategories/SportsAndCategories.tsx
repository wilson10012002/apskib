import { useFetch } from '../../../hooks/useFetch'
import { sportsApi, categoriesApi } from '../../../lib/api'

export default function SportsAndCategories() {
  const { data: sports, loading: loadingSports, error: sportsError } = useFetch(sportsApi.list, [])
  const { data: categories, loading: loadingCategories, error: categoriesError } = useFetch(
    categoriesApi.list,
    [],
  )

  const loading = loadingSports || loadingCategories
  const error = sportsError ?? categoriesError

  return (
    <section className="sports-section">

      <div className="section-container">

        {/* Cabeçalho */}

        <div className="section-header">
          <span className="section-label">
            Campeonato APSKIB
          </span>

          <h2>
            Modalidades e Categorias
          </h2>

          <p>
            Conheça as modalidades e categorias disponíveis
            neste campeonato de Sambo e Kurash.
          </p>
        </div>

        {loading && <p className="state-message">A carregar modalidades…</p>}

        {!loading && error && <p className="state-message error">{error}</p>}

        {!loading && !error && sports && categories && (
          <>
            {/* Modalidades */}

            <div className="sports-grid">

              {sports.map((sport) => (
                <article
                  className={`sport-card ${sport.color}`}
                  key={sport.id}
                >
                  <div className="sport-card-line" />

                  <div className="sport-card-content">

                    <span className="sport-type">
                      Modalidade competitiva
                    </span>

                    <h3>
                      {sport.name}
                    </h3>

                    <p>
                      {sport.description}
                    </p>

                  </div>

                </article>
              ))}

            </div>


            {/* Observação de inscrição */}

            <div className="registration-notice">

              <div className="notice-content">

                <span className="notice-label">
                  Atenção
                </span>

                <h3>
                  Regra de inscrição nas modalidades
                </h3>

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
                  Exemplo: Sambo Combate + Kurash
                  ou Sambo Desportivo + Kurash.
                </p>

              </div>

            </div>


            {/* Categorias */}

            <div className="categories">

              <div className="categories-header">

                <span className="section-label">
                  Faixas etárias
                </span>

                <h3>
                  Categorias
                </h3>

              </div>

              <div className="categories-grid">

                {categories.map((category, index) => (
                  <div
                    className="category-card"
                    key={category.id}
                  >
                    <span>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <strong>
                      {category.label}
                    </strong>
                  </div>
                ))}

              </div>

            </div>
          </>
        )}

      </div>

    </section>
  )
}

import PageHero from '../../components/common/PageHero/PageHero'
import { useFetch } from '../../hooks/useFetch'
import { resultsApi } from '../../lib/api'

export default function Results() {
  const { data: results, loading, error } = useFetch(() => resultsApi.list(), [])

  return (
    <>
      <PageHero
        title="Resultados"
        description="Resultados das competições organizadas pela APSKIB."
      />

      <section className="page-section">
        <div className="section-container">
          {loading && <p className="state-message">A carregar resultados…</p>}

          {!loading && error && <p className="state-message error">{error}</p>}

          {!loading && !error && (
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Competição</th>
                    <th>Modalidade</th>
                    <th>Categoria</th>
                    <th>Posição</th>
                    <th>Atleta</th>
                  </tr>
                </thead>

                <tbody>
                  {results && results.length > 0 ? (
                    results.map((result) => (
                      <tr key={result.id}>
                        <td>{result.competition?.title ?? '—'}</td>
                        <td>{result.sport?.name ?? '—'}</td>
                        <td>{result.category?.label ?? '—'}</td>
                        <td>{result.position}º</td>
                        <td>{result.athleteName}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="table-empty">
                        Sem resultados publicados no momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

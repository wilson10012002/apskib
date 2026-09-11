import PageHero from '../../components/common/PageHero/PageHero'
import { useFetch } from '../../hooks/useFetch'
import { rankingApi } from '../../lib/api'

export default function Ranking() {
  const { data: ranking, loading, error } = useFetch(() => rankingApi.list(), [])

  return (
    <>
      <PageHero
        title="Ranking"
        description="Classificação dos atletas por modalidade e categoria."
      />

      <section className="page-section">
        <div className="section-container">
          {loading && <p className="state-message">A carregar ranking…</p>}

          {!loading && error && <p className="state-message error">{error}</p>}

          {!loading && !error && (
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Atleta</th>
                    <th>Clube</th>
                    <th>Categoria</th>
                    <th>Pontos</th>
                  </tr>
                </thead>

                <tbody>
                  {ranking && ranking.length > 0 ? (
                    ranking.map((entry, index) => (
                      <tr key={entry.id}>
                        <td>{index + 1}º</td>
                        <td>{entry.athleteName}</td>
                        <td>{entry.clubName ?? '—'}</td>
                        <td>{entry.category?.label ?? '—'}</td>
                        <td>{entry.points}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="table-empty">
                        O ranking será publicado após a primeira competição
                        oficial.
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

import { Link } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import PageHero from '../../components/common/PageHero/PageHero'
import { useFetch } from '../../hooks/useFetch'
import { newsApi } from '../../lib/api'

function formatDate(value: string | null) {
  if (!value) return null
  return new Date(value).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function News() {
  const { data: posts, loading, error } = useFetch(newsApi.list, [])

  return (
    <>
      <PageHero
        title="Notícias"
        description="Últimas novidades sobre a APSKIB, os seus clubes e atletas."
      />

      <section className="page-section">
        <div className="section-container">
          {loading && <p className="state-message">A carregar notícias…</p>}

          {!loading && error && <p className="state-message error">{error}</p>}

          {!loading && !error && posts && posts.length > 0 && (
            <div className="info-grid three">
              {posts.map((post) => (
                <article className="info-card" key={post.id}>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  {formatDate(post.publishedAt) && (
                    <span className="news-card-date">{formatDate(post.publishedAt)}</span>
                  )}
                  <Link to={`/noticias/${post.slug}`} className="news-card-link">
                    Ler notícia →
                  </Link>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && posts && posts.length === 0 && (
            <div className="empty-state">
              <div className="icon-badge large">
                <Newspaper size={28} />
              </div>

              <span>APSKIB</span>
              <h2>Ainda sem notícias publicadas</h2>
              <p>
                Em breve encontrará aqui as últimas notícias sobre a APSKIB, os
                seus clubes e atletas.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

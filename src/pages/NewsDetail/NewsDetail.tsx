import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHero from '../../components/common/PageHero/PageHero'
import { useFetch } from '../../hooks/useFetch'
import { newsApi } from '../../lib/api'

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, loading, error } = useFetch(() => newsApi.bySlug(slug ?? ''), [slug])

  return (
    <>
      <PageHero eyebrow="Notícias" title={post?.title ?? 'Notícia'} />

      <section className="page-section">
        <div className="section-container narrow">
          {loading && <p className="state-message">A carregar notícia…</p>}

          {!loading && error && <p className="state-message error">{error}</p>}

          {!loading && !error && post && (
            <article className="news-article">
              {post.coverImageUrl && (
                <img className="news-article-cover" src={post.coverImageUrl} alt={post.title} />
              )}

              {post.publishedAt && (
                <span className="news-card-date">
                  {new Date(post.publishedAt).toLocaleDateString('pt-PT', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}

              <div className="news-article-body">
                {post.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? <p key={index}>{paragraph}</p> : null
                ))}
              </div>
            </article>
          )}

          <div className="section-cta">
            <Link to="/noticias" className="hero-link">
              <ArrowLeft size={15} />
              Voltar às notícias
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

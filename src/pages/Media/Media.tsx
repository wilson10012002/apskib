import { Image as ImageIcon } from 'lucide-react'
import PageHero from '../../components/common/PageHero/PageHero'
import { useFetch } from '../../hooks/useFetch'
import { galleryApi } from '../../lib/api'

export default function Media() {
  const { data: images, loading, error } = useFetch(galleryApi.list, [])

  return (
    <>
      <PageHero
        title="Multimédia"
        description="Fotografias e vídeos das atividades e competições da APSKIB."
      />

      <section className="page-section">
        <div className="section-container">
          {loading && <p className="state-message">A carregar galeria…</p>}

          {!loading && error && <p className="state-message error">{error}</p>}

          {!loading && !error && images && images.length > 0 && (
            <div className="gallery-grid">
              {images.map((image, index) => (
                <figure
                  className={`gallery-item ${image.featured || index === 0 ? 'featured' : ''}`}
                  key={image.id}
                >
                  <img src={image.url} alt={image.caption ?? 'APSKIB'} />
                  {image.caption && <figcaption>{image.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}

          {!loading && !error && images && images.length === 0 && (
            <div className="empty-state">
              <div className="icon-badge large">
                <ImageIcon size={28} />
              </div>

              <span>APSKIB</span>
              <h2>Galeria em crescimento</h2>
              <p>Novas fotografias e vídeos serão adicionados após cada evento.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

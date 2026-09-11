import { FileText, FolderOpen } from 'lucide-react'
import PageHero from '../../components/common/PageHero/PageHero'
import { useFetch } from '../../hooks/useFetch'
import { documentsApi } from '../../lib/api'

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Documents() {
  const { data: documents, loading, error } = useFetch(documentsApi.list, [])

  return (
    <>
      <PageHero
        title="Documentos"
        description="Estatutos, regulamentos e formulários oficiais da APSKIB."
      />

      <section className="page-section">
        <div className="section-container">
          {loading && <p className="state-message">A carregar documentos…</p>}

          {!loading && error && <p className="state-message error">{error}</p>}

          {!loading && !error && documents && documents.length > 0 && (
            <div className="info-grid two">
              {documents.map((doc) => (
                <a
                  className="doc-card"
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="doc-icon">
                    <FileText size={20} />
                  </div>

                  <div className="doc-info">
                    <h3>{doc.title}</h3>
                    {doc.description && <p>{doc.description}</p>}
                  </div>

                  <span className="doc-status">{formatFileSize(doc.fileSize)}</span>
                </a>
              ))}
            </div>
          )}

          {!loading && !error && documents && documents.length === 0 && (
            <div className="empty-state">
              <div className="icon-badge large">
                <FolderOpen size={28} />
              </div>

              <span>APSKIB</span>
              <h2>Ainda sem documentos publicados</h2>
              <p>
                Os estatutos, regulamentos e fichas oficiais da APSKIB serão
                disponibilizados aqui assim que estiverem prontos.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

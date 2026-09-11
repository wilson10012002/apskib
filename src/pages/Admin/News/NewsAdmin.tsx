import { useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useFetch } from '../../../hooks/useFetch'
import { getApiErrorMessage, newsAdminApi } from '../../../lib/api'
import type { ApiNewsPost, NewsInput } from '../../../types/api'
import { ConfirmDialog, EmptyState, ErrorState, Modal, Spinner } from '../../../components/admin/AdminUI'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function NewsAdmin() {
  const { data: posts, loading, error, reload } = useFetch(() => newsAdminApi.list(), [])

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editorPost, setEditorPost] = useState<ApiNewsPost | 'new' | null>(null)
  const [deletingPost, setDeletingPost] = useState<ApiNewsPost | null>(null)

  async function handleDelete() {
    if (!deletingPost) return
    setBusyId(deletingPost.id)
    setActionError(null)
    try {
      await newsAdminApi.remove(deletingPost.id)
      setDeletingPost(null)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível eliminar a notícia.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Notícias</h1>
          <p>Publicações e rascunhos do site.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setEditorPost('new')}>
          <Plus size={16} />
          Nova notícia
        </button>
      </div>

      {actionError && <ErrorState message={actionError} />}
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && posts && posts.length === 0 && (
        <EmptyState message="Ainda não existem notícias. Cria a primeira." />
      )}

      {!loading && !error && posts && posts.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Publicado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="admin-cell-primary">{post.title}</td>
                  <td>
                    <span className={`admin-pill admin-pill-${post.published ? 'published' : 'draft'}`}>
                      {post.published ? 'Publicada' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="admin-td-muted">{formatDate(post.publishedAt)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar"
                        disabled={busyId === post.id}
                        onClick={() => setEditorPost(post)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Eliminar"
                        disabled={busyId === post.id}
                        onClick={() => setDeletingPost(post)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editorPost && (
        <NewsEditorModal
          post={editorPost === 'new' ? null : editorPost}
          onClose={() => setEditorPost(null)}
          onSaved={() => {
            setEditorPost(null)
            reload()
          }}
        />
      )}

      {deletingPost && (
        <ConfirmDialog
          title="Eliminar notícia"
          message={`Tens a certeza que queres eliminar "${deletingPost.title}"?`}
          confirmLabel="Eliminar"
          danger
          busy={busyId === deletingPost.id}
          onConfirm={handleDelete}
          onCancel={() => setDeletingPost(null)}
        />
      )}
    </div>
  )
}

function NewsEditorModal({
  post,
  onClose,
  onSaved,
}: {
  post: ApiNewsPost | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    coverImageUrl: post?.coverImageUrl ?? '',
    published: post?.published ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const payload: NewsInput = {
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt,
      content: form.content,
      coverImageUrl: form.coverImageUrl || undefined,
      published: form.published,
    }

    try {
      if (post) {
        await newsAdminApi.update(post.id, payload)
      } else {
        await newsAdminApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar a notícia.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={post ? 'Editar notícia' : 'Nova notícia'} onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="news-title">Título</label>
          <input
            id="news-title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="news-slug">Slug (opcional)</label>
          <input
            id="news-slug"
            value={form.slug}
            placeholder="deixa em branco para gerar a partir do título"
            onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="news-excerpt">Resumo</label>
          <textarea
            id="news-excerpt"
            rows={2}
            value={form.excerpt}
            onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="news-content">Conteúdo</label>
          <textarea
            id="news-content"
            rows={8}
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            required
          />
          <p className="form-hint">Usa uma linha em branco para separar parágrafos.</p>
        </div>

        <div className="form-group">
          <label htmlFor="news-cover">URL da imagem de capa (opcional)</label>
          <input
            id="news-cover"
            value={form.coverImageUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, coverImageUrl: event.target.value }))}
          />
        </div>

        <label className="admin-checkbox-row">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(event) => setForm((prev) => ({ ...prev, published: event.target.checked }))}
          />
          Publicar imediatamente
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="admin-modal-actions">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

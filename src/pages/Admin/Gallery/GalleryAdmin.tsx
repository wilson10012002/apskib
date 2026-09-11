import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useFetch } from '../../../hooks/useFetch'
import { galleryAdminApi, galleryApi, getApiErrorMessage } from '../../../lib/api'
import type { ApiGalleryImage, GalleryInput } from '../../../types/api'
import { ConfirmDialog, EmptyState, ErrorState, Modal, Spinner } from '../../../components/admin/AdminUI'

export default function GalleryAdmin() {
  const { data: images, loading, error, reload } = useFetch(() => galleryApi.list(), [])

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editorItem, setEditorItem] = useState<ApiGalleryImage | 'new' | null>(null)
  const [deletingItem, setDeletingItem] = useState<ApiGalleryImage | null>(null)

  async function handleDelete() {
    if (!deletingItem) return
    setBusyId(deletingItem.id)
    setActionError(null)
    try {
      await galleryAdminApi.remove(deletingItem.id)
      setDeletingItem(null)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível eliminar a imagem.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Galeria</h1>
          <p>Imagens usadas na página de multimédia.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setEditorItem('new')}>
          <Plus size={16} />
          Nova imagem
        </button>
      </div>

      {actionError && <ErrorState message={actionError} />}
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && images && images.length === 0 && (
        <EmptyState message="Ainda não existem imagens na galeria." />
      )}

      {!loading && !error && images && images.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Legenda</th>
                <th>Destaque</th>
                <th>Ordem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {images.map((image) => (
                <tr key={image.id}>
                  <td>
                    <img src={image.url} alt={image.caption ?? ''} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                  </td>
                  <td className="admin-td-muted">{image.caption ?? '—'}</td>
                  <td>{image.featured ? <Star size={16} fill="currentColor" color="var(--amber)" /> : '—'}</td>
                  <td className="admin-td-muted">{image.order}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar"
                        disabled={busyId === image.id}
                        onClick={() => setEditorItem(image)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Eliminar"
                        disabled={busyId === image.id}
                        onClick={() => setDeletingItem(image)}
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

      {editorItem && (
        <GalleryEditorModal
          image={editorItem === 'new' ? null : editorItem}
          onClose={() => setEditorItem(null)}
          onSaved={() => {
            setEditorItem(null)
            reload()
          }}
        />
      )}

      {deletingItem && (
        <ConfirmDialog
          title="Eliminar imagem"
          message="Tens a certeza que queres eliminar esta imagem da galeria?"
          confirmLabel="Eliminar"
          danger
          busy={busyId === deletingItem.id}
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </div>
  )
}

function GalleryEditorModal({
  image,
  onClose,
  onSaved,
}: {
  image: ApiGalleryImage | null
  onClose: () => void
  onSaved: () => void
}) {
  const [caption, setCaption] = useState(image?.caption ?? '')
  const [featured, setFeatured] = useState(image?.featured ?? false)
  const [order, setOrder] = useState(image?.order ?? 0)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!image && !file) {
      setError('É necessário escolher uma imagem.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (image) {
        const payload: Partial<GalleryInput> = { caption: caption || undefined, featured, order }
        await galleryAdminApi.update(image.id, payload)
      } else {
        const formData = new FormData()
        if (caption) formData.append('caption', caption)
        formData.append('featured', String(featured))
        formData.append('order', String(order))
        if (file) formData.append('image', file)
        await galleryAdminApi.create(formData)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar a imagem.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={image ? 'Editar imagem' : 'Nova imagem'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {image?.url && (
          <div className="admin-file-preview">
            <img src={image.url} alt={image.caption ?? ''} />
            <span>Imagem atual</span>
          </div>
        )}

        {!image && (
          <div className="form-group">
            <label htmlFor="gallery-file">Imagem (JPEG, PNG ou WebP)</label>
            <input id="gallery-file" type="file" accept="image/*" onChange={handleFileChange} />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="gallery-caption">Legenda (opcional)</label>
          <input id="gallery-caption" value={caption} onChange={(event) => setCaption(event.target.value)} />
        </div>

        <div className="admin-form-grid">
          <div className="form-group">
            <label htmlFor="gallery-order">Ordem</label>
            <input
              id="gallery-order"
              type="number"
              value={order}
              onChange={(event) => setOrder(Number(event.target.value))}
            />
          </div>
        </div>

        <label className="admin-checkbox-row">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
          Destacar esta imagem (bloco maior na galeria)
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

import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useFetch } from '../../../hooks/useFetch'
import { documentsAdminApi, documentsApi, getApiErrorMessage } from '../../../lib/api'
import type { ApiDocument, DocumentInput } from '../../../types/api'
import { ConfirmDialog, EmptyState, ErrorState, Modal, Spinner } from '../../../components/admin/AdminUI'

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsAdmin() {
  const { data: documents, loading, error, reload } = useFetch(() => documentsApi.list(), [])

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editorItem, setEditorItem] = useState<ApiDocument | 'new' | null>(null)
  const [deletingItem, setDeletingItem] = useState<ApiDocument | null>(null)

  async function handleDelete() {
    if (!deletingItem) return
    setBusyId(deletingItem.id)
    setActionError(null)
    try {
      await documentsAdminApi.remove(deletingItem.id)
      setDeletingItem(null)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível eliminar o documento.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Documentos</h1>
          <p>Regulamentos, formulários e outros ficheiros públicos.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setEditorItem('new')}>
          <Plus size={16} />
          Novo documento
        </button>
      </div>

      {actionError && <ErrorState message={actionError} />}
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && documents && documents.length === 0 && (
        <EmptyState message="Ainda não existem documentos." />
      )}

      {!loading && !error && documents && documents.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Tamanho</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td className="admin-cell-primary">
                    <a href={document.fileUrl} target="_blank" rel="noreferrer">
                      {document.title}
                    </a>
                  </td>
                  <td className="admin-td-muted">{document.category}</td>
                  <td className="admin-td-muted">{formatFileSize(document.fileSize)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar"
                        disabled={busyId === document.id}
                        onClick={() => setEditorItem(document)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Eliminar"
                        disabled={busyId === document.id}
                        onClick={() => setDeletingItem(document)}
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
        <DocumentEditorModal
          document={editorItem === 'new' ? null : editorItem}
          onClose={() => setEditorItem(null)}
          onSaved={() => {
            setEditorItem(null)
            reload()
          }}
        />
      )}

      {deletingItem && (
        <ConfirmDialog
          title="Eliminar documento"
          message={`Tens a certeza que queres eliminar "${deletingItem.title}"?`}
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

function DocumentEditorModal({
  document,
  onClose,
  onSaved,
}: {
  document: ApiDocument | null
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(document?.title ?? '')
  const [description, setDescription] = useState(document?.description ?? '')
  const [category, setCategory] = useState(document?.category ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!document && !file) {
      setError('É necessário escolher um ficheiro.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (document) {
        const payload: Partial<DocumentInput> = {
          title,
          description: description || undefined,
          category,
        }
        await documentsAdminApi.update(document.id, payload)
      } else {
        const formData = new FormData()
        formData.append('title', title)
        if (description) formData.append('description', description)
        formData.append('category', category)
        if (file) formData.append('file', file)
        await documentsAdminApi.create(formData)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar o documento.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={document ? 'Editar documento' : 'Novo documento'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="document-title">Título</label>
          <input id="document-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </div>

        <div className="admin-form-grid">
          <div className="form-group full">
            <label htmlFor="document-description">Descrição (opcional)</label>
            <textarea
              id="document-description"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="form-group full">
            <label htmlFor="document-category">Categoria</label>
            <input
              id="document-category"
              placeholder="ex: Regulamentos, Formulários…"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            />
          </div>
        </div>

        {document ? (
          <p className="form-hint">
            Ficheiro atual: <a href={document.fileUrl} target="_blank" rel="noreferrer">{document.fileUrl}</a>. Para
            substituir o ficheiro, elimina este documento e cria um novo.
          </p>
        ) : (
          <div className="form-group">
            <label htmlFor="document-file">Ficheiro (PDF, DOC ou DOCX)</label>
            <input
              id="document-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </div>
        )}

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

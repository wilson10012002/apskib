import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useFetch } from '../../../hooks/useFetch'
import { getApiErrorMessage, partnersAdminApi, partnersApi } from '../../../lib/api'
import type { ApiPartner } from '../../../types/api'
import { ConfirmDialog, EmptyState, ErrorState, Modal, Spinner } from '../../../components/admin/AdminUI'

export default function PartnersAdmin() {
  const { data: partners, loading, error, reload } = useFetch(() => partnersApi.list(), [])

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editorItem, setEditorItem] = useState<ApiPartner | 'new' | null>(null)
  const [deletingItem, setDeletingItem] = useState<ApiPartner | null>(null)

  async function handleDelete() {
    if (!deletingItem) return
    setBusyId(deletingItem.id)
    setActionError(null)
    try {
      await partnersAdminApi.remove(deletingItem.id)
      setDeletingItem(null)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível eliminar o parceiro.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Parceiros</h1>
          <p>Logótipos e ligações dos parceiros/patrocinadores.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setEditorItem('new')}>
          <Plus size={16} />
          Novo parceiro
        </button>
      </div>

      {actionError && <ErrorState message={actionError} />}
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && partners && partners.length === 0 && (
        <EmptyState message="Ainda não existem parceiros." />
      )}

      {!loading && !error && partners && partners.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Logótipo</th>
                <th>Nome</th>
                <th>Website</th>
                <th>Ordem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id}>
                  <td>
                    {partner.logoUrl ? (
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        style={{ width: 40, height: 40, objectFit: 'contain' }}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="admin-cell-primary">{partner.name}</td>
                  <td className="admin-td-muted">{partner.website ?? '—'}</td>
                  <td className="admin-td-muted">{partner.order}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar"
                        disabled={busyId === partner.id}
                        onClick={() => setEditorItem(partner)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Eliminar"
                        disabled={busyId === partner.id}
                        onClick={() => setDeletingItem(partner)}
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
        <PartnerEditorModal
          partner={editorItem === 'new' ? null : editorItem}
          onClose={() => setEditorItem(null)}
          onSaved={() => {
            setEditorItem(null)
            reload()
          }}
        />
      )}

      {deletingItem && (
        <ConfirmDialog
          title="Eliminar parceiro"
          message={`Tens a certeza que queres eliminar "${deletingItem.name}"?`}
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

function PartnerEditorModal({
  partner,
  onClose,
  onSaved,
}: {
  partner: ApiPartner | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(partner?.name ?? '')
  const [website, setWebsite] = useState(partner?.website ?? '')
  const [order, setOrder] = useState(partner?.order ?? 0)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setLogoFile(event.target.files?.[0] ?? null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!partner && !logoFile) {
      setError('É necessário escolher um logótipo.')
      return
    }

    setSaving(true)
    setError(null)

    const formData = new FormData()
    formData.append('name', name)
    if (website) formData.append('website', website)
    formData.append('order', String(order))
    if (logoFile) formData.append('logo', logoFile)

    try {
      if (partner) {
        await partnersAdminApi.update(partner.id, formData)
      } else {
        await partnersAdminApi.create(formData)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar o parceiro.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={partner ? 'Editar parceiro' : 'Novo parceiro'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="partner-name">Nome</label>
          <input id="partner-name" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>

        <div className="admin-form-grid">
          <div className="form-group">
            <label htmlFor="partner-website">Website (opcional)</label>
            <input
              id="partner-website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="form-group">
            <label htmlFor="partner-order">Ordem</label>
            <input
              id="partner-order"
              type="number"
              value={order}
              onChange={(event) => setOrder(Number(event.target.value))}
            />
          </div>
        </div>

        {partner?.logoUrl && (
          <div className="admin-file-preview">
            <img src={partner.logoUrl} alt={partner.name} />
            <span>Logótipo atual (escolhe um novo ficheiro para substituir)</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="partner-logo">Logótipo {partner ? '(opcional)' : ''}</label>
          <input id="partner-logo" type="file" accept="image/*" onChange={handleFileChange} />
        </div>

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

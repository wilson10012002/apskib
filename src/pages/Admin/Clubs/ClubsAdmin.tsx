import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { useFetch } from '../../../hooks/useFetch'
import { clubsAdminApi, getApiErrorMessage } from '../../../lib/api'
import type { ApiAdminClub, ClubInput, EntityStatus } from '../../../types/api'
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Modal,
  Spinner,
  StatusPill,
} from '../../../components/admin/AdminUI'

const FILTERS: { value: EntityStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Rejeitados' },
]

export default function ClubsAdmin() {
  const [statusFilter, setStatusFilter] = useState<EntityStatus | 'all'>('pending')
  const { data: clubs, loading, error, reload } = useFetch(
    () => clubsAdminApi.list(statusFilter === 'all' ? undefined : statusFilter),
    [statusFilter],
  )

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editingClub, setEditingClub] = useState<ApiAdminClub | null>(null)
  const [deletingClub, setDeletingClub] = useState<ApiAdminClub | null>(null)

  async function handleStatusChange(club: ApiAdminClub, status: EntityStatus) {
    setBusyId(club.id)
    setActionError(null)
    try {
      await clubsAdminApi.setStatus(club.id, status)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível atualizar o estado do clube.'))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!deletingClub) return
    setBusyId(deletingClub.id)
    setActionError(null)
    try {
      await clubsAdminApi.remove(deletingClub.id)
      setDeletingClub(null)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível eliminar o clube.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Clubes</h1>
          <p>Pedidos de afiliação e clubes já registados.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-filter-group">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`admin-filter-chip${statusFilter === filter.value ? ' active' : ''}`}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {actionError && <ErrorState message={actionError} />}
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && clubs && clubs.length === 0 && (
        <EmptyState message="Não há clubes para este filtro." />
      )}

      {!loading && !error && clubs && clubs.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cidade</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club) => (
                <tr key={club.id}>
                  <td className="admin-cell-primary">{club.name}</td>
                  <td className="admin-td-muted">{club.city ?? '—'}</td>
                  <td className="admin-td-muted">
                    {club.contactName ?? '—'}
                    {club.contactEmail ? ` · ${club.contactEmail}` : ''}
                    {club.contactPhone ? ` · ${club.contactPhone}` : ''}
                  </td>
                  <td>
                    <StatusPill status={club.status} />
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      {club.status !== 'approved' && (
                        <button
                          type="button"
                          className="admin-icon-btn success"
                          title="Aprovar"
                          disabled={busyId === club.id}
                          onClick={() => handleStatusChange(club, 'approved')}
                        >
                          <Check size={15} />
                        </button>
                      )}
                      {club.status !== 'rejected' && (
                        <button
                          type="button"
                          className="admin-icon-btn danger"
                          title="Rejeitar"
                          disabled={busyId === club.id}
                          onClick={() => handleStatusChange(club, 'rejected')}
                        >
                          <X size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar"
                        disabled={busyId === club.id}
                        onClick={() => setEditingClub(club)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Eliminar"
                        disabled={busyId === club.id}
                        onClick={() => setDeletingClub(club)}
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

      {editingClub && (
        <EditClubModal
          club={editingClub}
          onClose={() => setEditingClub(null)}
          onSaved={() => {
            setEditingClub(null)
            reload()
          }}
        />
      )}

      {deletingClub && (
        <ConfirmDialog
          title="Eliminar clube"
          message={`Tens a certeza que queres eliminar "${deletingClub.name}"? Esta ação não pode ser revertida.`}
          confirmLabel="Eliminar"
          danger
          busy={busyId === deletingClub.id}
          onConfirm={handleDelete}
          onCancel={() => setDeletingClub(null)}
        />
      )}
    </div>
  )
}

function EditClubModal({
  club,
  onClose,
  onSaved,
}: {
  club: ApiAdminClub
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    name: club.name,
    city: club.city ?? '',
    contactName: club.contactName ?? '',
    contactEmail: club.contactEmail ?? '',
    contactPhone: club.contactPhone ?? '',
    notes: club.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const payload: ClubInput = {
      name: form.name,
      city: form.city || undefined,
      contactName: form.contactName || undefined,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      notes: form.notes || undefined,
    }

    try {
      await clubsAdminApi.update(club.id, payload)
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar as alterações.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Editar clube" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="club-name">Nome</label>
          <input
            id="club-name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </div>

        <div className="admin-form-grid">
          <div className="form-group">
            <label htmlFor="club-city">Cidade</label>
            <input
              id="club-city"
              value={form.city}
              onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="club-contact-name">Pessoa de contacto</label>
            <input
              id="club-contact-name"
              value={form.contactName}
              onChange={(event) => setForm((prev) => ({ ...prev, contactName: event.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="club-contact-email">Email de contacto</label>
            <input
              id="club-contact-email"
              type="email"
              value={form.contactEmail}
              onChange={(event) => setForm((prev) => ({ ...prev, contactEmail: event.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="club-contact-phone">Telefone de contacto</label>
            <input
              id="club-contact-phone"
              value={form.contactPhone}
              onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="club-notes">Notas internas</label>
          <textarea
            id="club-notes"
            rows={3}
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
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

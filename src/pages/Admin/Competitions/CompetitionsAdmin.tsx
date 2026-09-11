import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useFetch } from '../../../hooks/useFetch'
import { competitionsAdminApi, competitionsApi, getApiErrorMessage } from '../../../lib/api'
import type { ApiCompetition, CompetitionInput, CompetitionStatus } from '../../../types/api'
import { ConfirmDialog, EmptyState, ErrorState, Modal, Spinner } from '../../../components/admin/AdminUI'

export default function CompetitionsAdmin() {
  const { data: competitions, loading, error, reload } = useFetch(() => competitionsApi.list(), [])

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editorItem, setEditorItem] = useState<ApiCompetition | 'new' | null>(null)
  const [deletingItem, setDeletingItem] = useState<ApiCompetition | null>(null)

  async function handleDelete() {
    if (!deletingItem) return
    setBusyId(deletingItem.id)
    setActionError(null)
    try {
      await competitionsAdminApi.remove(deletingItem.id)
      setDeletingItem(null)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível eliminar a competição.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Competições</h1>
          <p>Calendário de competições do site.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setEditorItem('new')}>
          <Plus size={16} />
          Nova competição
        </button>
      </div>

      {actionError && <ErrorState message={actionError} />}
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && competitions && competitions.length === 0 && (
        <EmptyState message="Ainda não existem competições." />
      )}

      {!loading && !error && competitions && competitions.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Data</th>
                <th>Local</th>
                <th>Categoria</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {competitions.map((competition) => (
                <tr key={competition.id}>
                  <td className="admin-cell-primary">{competition.title}</td>
                  <td className="admin-td-muted">{competition.date}</td>
                  <td className="admin-td-muted">{competition.location}</td>
                  <td className="admin-td-muted">{competition.categoryLabel}</td>
                  <td>
                    <span className={`status-badge ${competition.status === 'completed' ? 'done' : 'scheduled'}`}>
                      {competition.status === 'completed' ? 'Concluída' : 'Agendada'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <Link
                        to={`/admin/atletas?competicao=${competition.id}`}
                        className="admin-icon-btn"
                        title="Ver inscritos"
                      >
                        <Users size={15} />
                      </Link>
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar"
                        disabled={busyId === competition.id}
                        onClick={() => setEditorItem(competition)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Eliminar"
                        disabled={busyId === competition.id}
                        onClick={() => setDeletingItem(competition)}
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
        <CompetitionEditorModal
          competition={editorItem === 'new' ? null : editorItem}
          onClose={() => setEditorItem(null)}
          onSaved={() => {
            setEditorItem(null)
            reload()
          }}
        />
      )}

      {deletingItem && (
        <ConfirmDialog
          title="Eliminar competição"
          message={`Tens a certeza que queres eliminar "${deletingItem.title}"? Os resultados associados também serão eliminados.`}
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

function CompetitionEditorModal({
  competition,
  onClose,
  onSaved,
}: {
  competition: ApiCompetition | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    title: competition?.title ?? '',
    date: competition?.date ?? '',
    location: competition?.location ?? '',
    categoryLabel: competition?.categoryLabel ?? '',
    status: (competition?.status ?? 'scheduled') as CompetitionStatus,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const payload: CompetitionInput = { ...form }

    try {
      if (competition) {
        await competitionsAdminApi.update(competition.id, payload)
      } else {
        await competitionsAdminApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar a competição.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={competition ? 'Editar competição' : 'Nova competição'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="competition-title">Título</label>
          <input
            id="competition-title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
        </div>

        <div className="admin-form-grid">
          <div className="form-group">
            <label htmlFor="competition-date">Data (texto livre)</label>
            <input
              id="competition-date"
              placeholder="ex: 12–13 Setembro 2026"
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="competition-location">Local</label>
            <input
              id="competition-location"
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="competition-category-label">Categoria/tipo</label>
            <input
              id="competition-category-label"
              placeholder="ex: Campeonato Provincial"
              value={form.categoryLabel}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryLabel: event.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="competition-status">Estado</label>
            <select
              id="competition-status"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as CompetitionStatus }))
              }
            >
              <option value="scheduled">Agendada</option>
              <option value="completed">Concluída</option>
            </select>
          </div>
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

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { useFetch } from '../../../hooks/useFetch'
import { athletesAdminApi, categoriesApi, competitionsApi, getApiErrorMessage, sportsApi } from '../../../lib/api'
import type {
  ApiAdminAthlete,
  ApiCategory,
  ApiCompetition,
  ApiSport,
  AthleteInput,
  EntityStatus,
} from '../../../types/api'
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

interface ReferenceData {
  categories: ApiCategory[]
  sports: ApiSport[]
  competitions: ApiCompetition[]
}

async function loadReferenceData(): Promise<ReferenceData> {
  const [categories, sports, competitions] = await Promise.all([
    categoriesApi.list(),
    sportsApi.list(),
    competitionsApi.list(),
  ])
  return { categories, sports, competitions }
}

export default function AthletesAdmin() {
  const [statusFilter, setStatusFilter] = useState<EntityStatus | 'all'>('pending')
  const [searchParams, setSearchParams] = useSearchParams()
  const competitionFilter = searchParams.get('competicao') ?? 'all'

  const { data: athletes, loading, error, reload } = useFetch(
    () =>
      athletesAdminApi.list({
        status: statusFilter === 'all' ? undefined : statusFilter,
        competitionId: competitionFilter === 'all' ? undefined : competitionFilter,
      }),
    [statusFilter, competitionFilter],
  )
  const { data: reference } = useFetch(loadReferenceData, [])

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editingAthlete, setEditingAthlete] = useState<ApiAdminAthlete | null>(null)
  const [deletingAthlete, setDeletingAthlete] = useState<ApiAdminAthlete | null>(null)

  function handleCompetitionFilterChange(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === 'all') {
        next.delete('competicao')
      } else {
        next.set('competicao', value)
      }
      return next
    })
  }

  async function handleStatusChange(athlete: ApiAdminAthlete, status: EntityStatus) {
    setBusyId(athlete.id)
    setActionError(null)
    try {
      await athletesAdminApi.setStatus(athlete.id, status)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível atualizar o estado do atleta.'))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!deletingAthlete) return
    setBusyId(deletingAthlete.id)
    setActionError(null)
    try {
      await athletesAdminApi.remove(deletingAthlete.id)
      setDeletingAthlete(null)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível eliminar o atleta.'))
    } finally {
      setBusyId(null)
    }
  }

  const filteredCompetitionTitle =
    competitionFilter !== 'all'
      ? reference?.competitions.find((competition) => competition.id === competitionFilter)?.title
      : undefined

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Atletas</h1>
          <p>
            {filteredCompetitionTitle
              ? `Inscrições para "${filteredCompetitionTitle}".`
              : 'Pedidos de inscrição e atletas federados.'}
          </p>
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

        {reference && reference.competitions.length > 0 && (
          <select value={competitionFilter} onChange={(event) => handleCompetitionFilterChange(event.target.value)}>
            <option value="all">Todas as competições</option>
            {reference.competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {actionError && <ErrorState message={actionError} />}
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && athletes && athletes.length === 0 && (
        <EmptyState message="Não há atletas para este filtro." />
      )}

      {!loading && !error && athletes && athletes.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contacto</th>
                <th>Clube</th>
                <th>Categoria</th>
                <th>Competição</th>
                <th>Modalidades</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {athletes.map((athlete) => (
                <tr key={athlete.id}>
                  <td className="admin-cell-primary">{athlete.fullName}</td>
                  <td className="admin-td-muted">
                    {athlete.phone}
                    <br />
                    {athlete.email}
                  </td>
                  <td className="admin-td-muted">{athlete.club?.name ?? athlete.clubName ?? '—'}</td>
                  <td className="admin-td-muted">{athlete.category?.label ?? '—'}</td>
                  <td className="admin-td-muted">{athlete.competition?.title ?? '—'}</td>
                  <td className="admin-td-muted">
                    {athlete.sports.map((entry) => entry.sport.name).join(', ') || '—'}
                  </td>
                  <td>
                    <StatusPill status={athlete.status} />
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      {athlete.status !== 'approved' && (
                        <button
                          type="button"
                          className="admin-icon-btn success"
                          title="Aprovar"
                          disabled={busyId === athlete.id}
                          onClick={() => handleStatusChange(athlete, 'approved')}
                        >
                          <Check size={15} />
                        </button>
                      )}
                      {athlete.status !== 'rejected' && (
                        <button
                          type="button"
                          className="admin-icon-btn danger"
                          title="Rejeitar"
                          disabled={busyId === athlete.id}
                          onClick={() => handleStatusChange(athlete, 'rejected')}
                        >
                          <X size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar"
                        disabled={busyId === athlete.id}
                        onClick={() => setEditingAthlete(athlete)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Eliminar"
                        disabled={busyId === athlete.id}
                        onClick={() => setDeletingAthlete(athlete)}
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

      {editingAthlete && reference && (
        <EditAthleteModal
          athlete={editingAthlete}
          categories={reference.categories}
          sports={reference.sports}
          competitions={reference.competitions}
          onClose={() => setEditingAthlete(null)}
          onSaved={() => {
            setEditingAthlete(null)
            reload()
          }}
        />
      )}

      {deletingAthlete && (
        <ConfirmDialog
          title="Eliminar atleta"
          message={`Tens a certeza que queres eliminar "${deletingAthlete.fullName}"? Esta ação não pode ser revertida.`}
          confirmLabel="Eliminar"
          danger
          busy={busyId === deletingAthlete.id}
          onConfirm={handleDelete}
          onCancel={() => setDeletingAthlete(null)}
        />
      )}
    </div>
  )
}

function EditAthleteModal({
  athlete,
  categories,
  sports,
  competitions,
  onClose,
  onSaved,
}: {
  athlete: ApiAdminAthlete
  categories: ApiCategory[]
  sports: ApiSport[]
  competitions: ApiCompetition[]
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    fullName: athlete.fullName,
    gender: athlete.gender,
    phone: athlete.phone,
    email: athlete.email,
    categoryId: athlete.categoryId ?? '',
    competitionId: athlete.competitionId ?? '',
    clubName: athlete.clubName ?? '',
    notes: athlete.notes ?? '',
  })
  const [sportIds, setSportIds] = useState<string[]>(athlete.sports.map((entry) => entry.sport.id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleSport(id: string) {
    setSportIds((prev) => (prev.includes(id) ? prev.filter((sportId) => sportId !== id) : [...prev, id]))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const payload: AthleteInput = {
      fullName: form.fullName,
      gender: form.gender,
      phone: form.phone,
      email: form.email,
      categoryId: form.categoryId || null,
      competitionId: form.competitionId || null,
      clubName: form.clubName || null,
      notes: form.notes || null,
      sportIds,
    }

    try {
      await athletesAdminApi.update(athlete.id, payload)
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar as alterações.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Editar atleta" onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <div className="form-group full">
            <label htmlFor="athlete-name">Nome completo</label>
            <input
              id="athlete-name"
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="athlete-gender">Género</label>
            <input
              id="athlete-gender"
              value={form.gender}
              onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="athlete-phone">Telefone</label>
            <input
              id="athlete-phone"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="athlete-email">Email</label>
            <input
              id="athlete-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="athlete-category">Categoria</label>
            <select
              id="athlete-category"
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="athlete-competition">Competição</label>
            <select
              id="athlete-competition"
              value={form.competitionId}
              onChange={(event) => setForm((prev) => ({ ...prev, competitionId: event.target.value }))}
            >
              <option value="">Sem competição</option>
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group full">
            <label htmlFor="athlete-club">Clube (texto livre)</label>
            <input
              id="athlete-club"
              value={form.clubName}
              onChange={(event) => setForm((prev) => ({ ...prev, clubName: event.target.value }))}
            />
          </div>
        </div>

        <div className="form-fieldset">
          <legend>Modalidades</legend>
          <div className="radio-group">
            {sports.map((sport) => (
              <label key={sport.id} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={sportIds.includes(sport.id)}
                  onChange={() => toggleSport(sport.id)}
                />
                {sport.name}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="athlete-notes">Notas internas</label>
          <textarea
            id="athlete-notes"
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

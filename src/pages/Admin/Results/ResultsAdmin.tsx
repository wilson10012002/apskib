import { useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useFetch } from '../../../hooks/useFetch'
import { competitionsApi, getApiErrorMessage, resultsAdminApi, resultsApi, sportsApi, categoriesApi } from '../../../lib/api'
import type { ApiCategory, ApiCompetition, ApiResult, ApiSport, ResultInput } from '../../../types/api'
import { ConfirmDialog, EmptyState, ErrorState, Modal, Spinner } from '../../../components/admin/AdminUI'

interface ReferenceData {
  competitions: ApiCompetition[]
  sports: ApiSport[]
  categories: ApiCategory[]
}

async function loadReferenceData(): Promise<ReferenceData> {
  const [competitions, sports, categories] = await Promise.all([
    competitionsApi.list(),
    sportsApi.list(),
    categoriesApi.list(),
  ])
  return { competitions, sports, categories }
}

export default function ResultsAdmin() {
  const [competitionFilter, setCompetitionFilter] = useState<string>('all')
  const { data: results, loading, error, reload } = useFetch(
    () => resultsApi.list(competitionFilter === 'all' ? undefined : competitionFilter),
    [competitionFilter],
  )
  const { data: reference } = useFetch(loadReferenceData, [])

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editorItem, setEditorItem] = useState<ApiResult | 'new' | null>(null)
  const [deletingItem, setDeletingItem] = useState<ApiResult | null>(null)

  async function handleDelete() {
    if (!deletingItem) return
    setBusyId(deletingItem.id)
    setActionError(null)
    try {
      await resultsAdminApi.remove(deletingItem.id)
      setDeletingItem(null)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível eliminar o resultado.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Resultados</h1>
          <p>Classificações registadas por competição.</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => setEditorItem('new')}
          disabled={!reference || reference.competitions.length === 0}
        >
          <Plus size={16} />
          Novo resultado
        </button>
      </div>

      {reference && reference.competitions.length > 0 && (
        <div className="admin-toolbar">
          <select value={competitionFilter} onChange={(event) => setCompetitionFilter(event.target.value)}>
            <option value="all">Todas as competições</option>
            {reference.competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {actionError && <ErrorState message={actionError} />}
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && reference && reference.competitions.length === 0 && (
        <EmptyState message="Cria primeiro uma competição para poderes registar resultados." />
      )}

      {!loading && !error && results && results.length === 0 && reference && reference.competitions.length > 0 && (
        <EmptyState message="Ainda não há resultados para este filtro." />
      )}

      {!loading && !error && results && results.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Competição</th>
                <th>Atleta</th>
                <th>Posição</th>
                <th>Modalidade</th>
                <th>Categoria</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
                  <td className="admin-td-muted">{result.competition?.title ?? '—'}</td>
                  <td className="admin-cell-primary">{result.athleteName}</td>
                  <td className="admin-td-muted">{result.position}º</td>
                  <td className="admin-td-muted">{result.sport?.name ?? '—'}</td>
                  <td className="admin-td-muted">{result.category?.label ?? '—'}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar"
                        disabled={busyId === result.id}
                        onClick={() => setEditorItem(result)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Eliminar"
                        disabled={busyId === result.id}
                        onClick={() => setDeletingItem(result)}
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

      {editorItem && reference && (
        <ResultEditorModal
          result={editorItem === 'new' ? null : editorItem}
          reference={reference}
          onClose={() => setEditorItem(null)}
          onSaved={() => {
            setEditorItem(null)
            reload()
          }}
        />
      )}

      {deletingItem && (
        <ConfirmDialog
          title="Eliminar resultado"
          message={`Tens a certeza que queres eliminar o resultado de "${deletingItem.athleteName}"?`}
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

function ResultEditorModal({
  result,
  reference,
  onClose,
  onSaved,
}: {
  result: ApiResult | null
  reference: ReferenceData
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    competitionId: result?.competitionId ?? reference.competitions[0]?.id ?? '',
    sportId: result?.sport?.id ?? '',
    categoryId: result?.category?.id ?? '',
    athleteName: result?.athleteName ?? '',
    position: result?.position ?? 1,
    notes: result?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const payload: ResultInput = {
      competitionId: form.competitionId,
      sportId: form.sportId || undefined,
      categoryId: form.categoryId || undefined,
      athleteName: form.athleteName,
      position: Number(form.position),
      notes: form.notes || undefined,
    }

    try {
      if (result) {
        await resultsAdminApi.update(result.id, payload)
      } else {
        await resultsAdminApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar o resultado.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={result ? 'Editar resultado' : 'Novo resultado'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="result-competition">Competição</label>
          <select
            id="result-competition"
            value={form.competitionId}
            onChange={(event) => setForm((prev) => ({ ...prev, competitionId: event.target.value }))}
            required
          >
            {reference.competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.title}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-form-grid">
          <div className="form-group">
            <label htmlFor="result-athlete-name">Nome do atleta</label>
            <input
              id="result-athlete-name"
              value={form.athleteName}
              onChange={(event) => setForm((prev) => ({ ...prev, athleteName: event.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="result-position">Posição</label>
            <input
              id="result-position"
              type="number"
              min={1}
              value={form.position}
              onChange={(event) => setForm((prev) => ({ ...prev, position: Number(event.target.value) }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="result-sport">Modalidade (opcional)</label>
            <select
              id="result-sport"
              value={form.sportId}
              onChange={(event) => setForm((prev) => ({ ...prev, sportId: event.target.value }))}
            >
              <option value="">—</option>
              {reference.sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="result-category">Categoria (opcional)</label>
            <select
              id="result-category"
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            >
              <option value="">—</option>
              {reference.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="result-notes">Notas (opcional)</label>
          <textarea
            id="result-notes"
            rows={2}
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

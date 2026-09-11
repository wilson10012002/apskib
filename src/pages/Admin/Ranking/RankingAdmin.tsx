import { useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useFetch } from '../../../hooks/useFetch'
import { categoriesApi, getApiErrorMessage, rankingAdminApi, rankingApi } from '../../../lib/api'
import type { ApiCategory, ApiRankingEntry, RankingInput } from '../../../types/api'
import { ConfirmDialog, EmptyState, ErrorState, Modal, Spinner } from '../../../components/admin/AdminUI'

export default function RankingAdmin() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const { data: ranking, loading, error, reload } = useFetch(
    () => rankingApi.list(categoryFilter === 'all' ? undefined : categoryFilter),
    [categoryFilter],
  )
  const { data: categories } = useFetch(() => categoriesApi.list(), [])

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editorItem, setEditorItem] = useState<ApiRankingEntry | 'new' | null>(null)
  const [deletingItem, setDeletingItem] = useState<ApiRankingEntry | null>(null)

  async function handleDelete() {
    if (!deletingItem) return
    setBusyId(deletingItem.id)
    setActionError(null)
    try {
      await rankingAdminApi.remove(deletingItem.id)
      setDeletingItem(null)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível eliminar a entrada de ranking.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Ranking</h1>
          <p>Pontuações dos atletas por categoria.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setEditorItem('new')}>
          <Plus size={16} />
          Nova entrada
        </button>
      </div>

      {categories && categories.length > 0 && (
        <div className="admin-toolbar">
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {actionError && <ErrorState message={actionError} />}
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && ranking && ranking.length === 0 && (
        <EmptyState message="Ainda não há entradas de ranking para este filtro." />
      )}

      {!loading && !error && ranking && ranking.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Atleta</th>
                <th>Clube</th>
                <th>Categoria</th>
                <th>Pontos</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry) => (
                <tr key={entry.id}>
                  <td className="admin-cell-primary">{entry.athleteName}</td>
                  <td className="admin-td-muted">{entry.clubName ?? '—'}</td>
                  <td className="admin-td-muted">{entry.category?.label ?? '—'}</td>
                  <td className="admin-td-muted">{entry.points}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar"
                        disabled={busyId === entry.id}
                        onClick={() => setEditorItem(entry)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Eliminar"
                        disabled={busyId === entry.id}
                        onClick={() => setDeletingItem(entry)}
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
        <RankingEditorModal
          entry={editorItem === 'new' ? null : editorItem}
          categories={categories ?? []}
          onClose={() => setEditorItem(null)}
          onSaved={() => {
            setEditorItem(null)
            reload()
          }}
        />
      )}

      {deletingItem && (
        <ConfirmDialog
          title="Eliminar entrada de ranking"
          message={`Tens a certeza que queres eliminar a entrada de "${deletingItem.athleteName}"?`}
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

function RankingEditorModal({
  entry,
  categories,
  onClose,
  onSaved,
}: {
  entry: ApiRankingEntry | null
  categories: ApiCategory[]
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    athleteName: entry?.athleteName ?? '',
    clubName: entry?.clubName ?? '',
    points: entry?.points ?? 0,
    categoryId: entry?.category?.id ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const payload: RankingInput = {
      athleteName: form.athleteName,
      clubName: form.clubName || undefined,
      points: Number(form.points),
      categoryId: form.categoryId || undefined,
    }

    try {
      if (entry) {
        await rankingAdminApi.update(entry.id, payload)
      } else {
        await rankingAdminApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar a entrada de ranking.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={entry ? 'Editar entrada' : 'Nova entrada'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <div className="form-group full">
            <label htmlFor="ranking-athlete-name">Nome do atleta</label>
            <input
              id="ranking-athlete-name"
              value={form.athleteName}
              onChange={(event) => setForm((prev) => ({ ...prev, athleteName: event.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="ranking-club">Clube (opcional)</label>
            <input
              id="ranking-club"
              value={form.clubName}
              onChange={(event) => setForm((prev) => ({ ...prev, clubName: event.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="ranking-points">Pontos</label>
            <input
              id="ranking-points"
              type="number"
              min={0}
              value={form.points}
              onChange={(event) => setForm((prev) => ({ ...prev, points: Number(event.target.value) }))}
              required
            />
          </div>
          <div className="form-group full">
            <label htmlFor="ranking-category">Categoria (opcional)</label>
            <select
              id="ranking-category"
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            >
              <option value="">—</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
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

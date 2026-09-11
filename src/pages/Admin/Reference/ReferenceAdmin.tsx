import { useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useFetch } from '../../../hooks/useFetch'
import {
  categoriesAdminApi,
  categoriesApi,
  getApiErrorMessage,
  sportsAdminApi,
  sportsApi,
} from '../../../lib/api'
import type { ApiCategory, ApiSport, CategoryInput, SportColor, SportInput } from '../../../types/api'
import { ConfirmDialog, EmptyState, ErrorState, Modal, Spinner } from '../../../components/admin/AdminUI'

type Tab = 'sports' | 'categories'

export default function ReferenceAdmin() {
  const [tab, setTab] = useState<Tab>('sports')

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Modalidades e categorias</h1>
          <p>Dados de referência usados em todo o site (inscrições, resultados, ranking).</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-filter-group">
          <button
            type="button"
            className={`admin-filter-chip${tab === 'sports' ? ' active' : ''}`}
            onClick={() => setTab('sports')}
          >
            Modalidades
          </button>
          <button
            type="button"
            className={`admin-filter-chip${tab === 'categories' ? ' active' : ''}`}
            onClick={() => setTab('categories')}
          >
            Categorias
          </button>
        </div>
      </div>

      {tab === 'sports' ? <SportsTab /> : <CategoriesTab />}
    </div>
  )
}

function SportsTab() {
  const { data: sports, loading, error, reload } = useFetch(() => sportsApi.list(), [])

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editorItem, setEditorItem] = useState<ApiSport | 'new' | null>(null)
  const [deletingItem, setDeletingItem] = useState<ApiSport | null>(null)

  async function handleDelete() {
    if (!deletingItem) return
    setBusyId(deletingItem.id)
    setActionError(null)
    try {
      await sportsAdminApi.remove(deletingItem.id)
      setDeletingItem(null)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível eliminar a modalidade.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-toolbar" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setEditorItem('new')}>
          <Plus size={16} />
          Nova modalidade
        </button>
      </div>

      {actionError && <ErrorState message={actionError} />}
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && sports && sports.length === 0 && <EmptyState message="Ainda não há modalidades." />}

      {!loading && !error && sports && sports.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Slug</th>
                <th>Cor</th>
                <th>Ordem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sports.map((sport) => (
                <tr key={sport.id}>
                  <td className="admin-cell-primary">{sport.name}</td>
                  <td className="admin-td-muted">{sport.slug}</td>
                  <td className="admin-td-muted" style={{ textTransform: 'capitalize' }}>{sport.color}</td>
                  <td className="admin-td-muted">{sport.order}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar"
                        disabled={busyId === sport.id}
                        onClick={() => setEditorItem(sport)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Eliminar"
                        disabled={busyId === sport.id}
                        onClick={() => setDeletingItem(sport)}
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
        <SportEditorModal
          sport={editorItem === 'new' ? null : editorItem}
          onClose={() => setEditorItem(null)}
          onSaved={() => {
            setEditorItem(null)
            reload()
          }}
        />
      )}

      {deletingItem && (
        <ConfirmDialog
          title="Eliminar modalidade"
          message={`Tens a certeza que queres eliminar "${deletingItem.name}"? Isto pode afetar atletas e resultados já registados.`}
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

function SportEditorModal({
  sport,
  onClose,
  onSaved,
}: {
  sport: ApiSport | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    slug: sport?.slug ?? '',
    name: sport?.name ?? '',
    color: (sport?.color ?? 'blue') as SportColor,
    description: sport?.description ?? '',
    rules: sport?.rules.join('\n') ?? '',
    order: sport?.order ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const payload: SportInput = {
      slug: form.slug,
      name: form.name,
      color: form.color,
      description: form.description,
      rules: form.rules
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      order: Number(form.order),
    }

    try {
      if (sport) {
        await sportsAdminApi.update(sport.id, payload)
      } else {
        await sportsAdminApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar a modalidade.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={sport ? 'Editar modalidade' : 'Nova modalidade'} onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <div className="form-group">
            <label htmlFor="sport-name">Nome</label>
            <input
              id="sport-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="sport-slug">Slug</label>
            <input
              id="sport-slug"
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="sport-color">Cor</label>
            <select
              id="sport-color"
              value={form.color}
              onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value as SportColor }))}
            >
              <option value="red">Vermelho</option>
              <option value="blue">Azul</option>
              <option value="green">Verde</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="sport-order">Ordem</label>
            <input
              id="sport-order"
              type="number"
              value={form.order}
              onChange={(event) => setForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="sport-description">Descrição</label>
          <textarea
            id="sport-description"
            rows={3}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sport-rules">Regras (uma por linha)</label>
          <textarea
            id="sport-rules"
            rows={4}
            value={form.rules}
            onChange={(event) => setForm((prev) => ({ ...prev, rules: event.target.value }))}
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

function CategoriesTab() {
  const { data: categories, loading, error, reload } = useFetch(() => categoriesApi.list(), [])

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editorItem, setEditorItem] = useState<ApiCategory | 'new' | null>(null)
  const [deletingItem, setDeletingItem] = useState<ApiCategory | null>(null)

  async function handleDelete() {
    if (!deletingItem) return
    setBusyId(deletingItem.id)
    setActionError(null)
    try {
      await categoriesAdminApi.remove(deletingItem.id)
      setDeletingItem(null)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível eliminar a categoria.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-toolbar" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setEditorItem('new')}>
          <Plus size={16} />
          Nova categoria
        </button>
      </div>

      {actionError && <ErrorState message={actionError} />}
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && categories && categories.length === 0 && (
        <EmptyState message="Ainda não há categorias." />
      )}

      {!loading && !error && categories && categories.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Slug</th>
                <th>Faixa etária</th>
                <th>Ordem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="admin-cell-primary">{category.label}</td>
                  <td className="admin-td-muted">{category.slug}</td>
                  <td className="admin-td-muted">{category.ageRange}</td>
                  <td className="admin-td-muted">{category.order}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar"
                        disabled={busyId === category.id}
                        onClick={() => setEditorItem(category)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Eliminar"
                        disabled={busyId === category.id}
                        onClick={() => setDeletingItem(category)}
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
        <CategoryEditorModal
          category={editorItem === 'new' ? null : editorItem}
          onClose={() => setEditorItem(null)}
          onSaved={() => {
            setEditorItem(null)
            reload()
          }}
        />
      )}

      {deletingItem && (
        <ConfirmDialog
          title="Eliminar categoria"
          message={`Tens a certeza que queres eliminar "${deletingItem.label}"? Isto pode afetar atletas e resultados já registados.`}
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

function CategoryEditorModal({
  category,
  onClose,
  onSaved,
}: {
  category: ApiCategory | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    slug: category?.slug ?? '',
    label: category?.label ?? '',
    ageRange: category?.ageRange ?? '',
    order: category?.order ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const payload: CategoryInput = {
      slug: form.slug,
      label: form.label,
      ageRange: form.ageRange,
      order: Number(form.order),
    }

    try {
      if (category) {
        await categoriesAdminApi.update(category.id, payload)
      } else {
        await categoriesAdminApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar a categoria.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={category ? 'Editar categoria' : 'Nova categoria'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <div className="form-group full">
            <label htmlFor="category-label">Nome</label>
            <input
              id="category-label"
              value={form.label}
              onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category-slug">Slug</label>
            <input
              id="category-slug"
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category-age-range">Faixa etária</label>
            <input
              id="category-age-range"
              placeholder="ex: 12–14 anos"
              value={form.ageRange}
              onChange={(event) => setForm((prev) => ({ ...prev, ageRange: event.target.value }))}
              required
            />
          </div>
          <div className="form-group full">
            <label htmlFor="category-order">Ordem</label>
            <input
              id="category-order"
              type="number"
              value={form.order}
              onChange={(event) => setForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
            />
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

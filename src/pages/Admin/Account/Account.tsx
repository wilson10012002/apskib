import { useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, KeyRound } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { authApi, getApiErrorMessage } from '../../../lib/api'

export default function Account() {
  const { admin } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword.length < 8) {
      setError('A nova password deve ter pelo menos 8 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação não coincide com a nova password.')
      return
    }

    setSaving(true)

    try {
      await authApi.changePassword({ currentPassword, newPassword })
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível alterar a password.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>A minha conta</h1>
          <p>Dados de acesso ao painel de administração.</p>
        </div>
      </div>

      <div className="admin-card admin-account-card">
        <div className="form-group">
          <label>Nome</label>
          <p className="admin-cell-primary">{admin?.name}</p>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Email</label>
          <p className="admin-td-muted">{admin?.email}</p>
        </div>
      </div>

      <div className="admin-card admin-account-card">
        <h3 className="admin-account-heading">
          <KeyRound size={18} />
          Alterar password
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="account-current-password">Password atual</label>
            <input
              id="account-current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="account-new-password">Nova password</label>
            <input
              id="account-new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
            <p className="form-hint">Mínimo de 8 caracteres.</p>
          </div>

          <div className="form-group">
            <label htmlFor="account-confirm-password">Confirmar nova password</label>
            <input
              id="account-confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          {success && (
            <p className="form-success with-icon">
              <CheckCircle2 size={15} />
              Password atualizada com sucesso.
            </p>
          )}

          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'A guardar…' : 'Alterar password'}
          </button>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Eye, Mail, Trash2 } from 'lucide-react'
import { useFetch } from '../../../hooks/useFetch'
import { contactAdminApi, getApiErrorMessage } from '../../../lib/api'
import type { ApiContactMessage } from '../../../types/api'
import { ConfirmDialog, EmptyState, ErrorState, Modal, Spinner } from '../../../components/admin/AdminUI'

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ContactAdmin() {
  const [unreadOnly, setUnreadOnly] = useState(false)
  const { data: messages, loading, error, reload } = useFetch(
    () => contactAdminApi.list(unreadOnly || undefined),
    [unreadOnly],
  )

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [viewingMessage, setViewingMessage] = useState<ApiContactMessage | null>(null)
  const [deletingMessage, setDeletingMessage] = useState<ApiContactMessage | null>(null)

  async function handleOpen(message: ApiContactMessage) {
    setViewingMessage(message)
    if (!message.read) {
      setBusyId(message.id)
      try {
        await contactAdminApi.markRead(message.id)
        reload()
      } catch (err) {
        setActionError(getApiErrorMessage(err, 'Não foi possível marcar a mensagem como lida.'))
      } finally {
        setBusyId(null)
      }
    }
  }

  async function handleDelete() {
    if (!deletingMessage) return
    setBusyId(deletingMessage.id)
    setActionError(null)
    try {
      await contactAdminApi.remove(deletingMessage.id)
      setDeletingMessage(null)
      setViewingMessage(null)
      reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Não foi possível eliminar a mensagem.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Mensagens</h1>
          <p>Mensagens recebidas através do formulário de contacto.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-filter-group">
          <button
            type="button"
            className={`admin-filter-chip${!unreadOnly ? ' active' : ''}`}
            onClick={() => setUnreadOnly(false)}
          >
            Todas
          </button>
          <button
            type="button"
            className={`admin-filter-chip${unreadOnly ? ' active' : ''}`}
            onClick={() => setUnreadOnly(true)}
          >
            Por ler
          </button>
        </div>
      </div>

      {actionError && <ErrorState message={actionError} />}
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && messages && messages.length === 0 && (
        <EmptyState message="Não há mensagens para este filtro." />
      )}

      {!loading && !error && messages && messages.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Remetente</th>
                <th>Assunto</th>
                <th>Recebida em</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td className="admin-cell-primary">
                    {message.name}
                    <br />
                    <span className="admin-td-muted">{message.email}</span>
                  </td>
                  <td className="admin-td-muted">{message.subject ?? '—'}</td>
                  <td className="admin-td-muted">{formatDateTime(message.createdAt)}</td>
                  <td>
                    {!message.read && <span className="admin-pill admin-pill-unread">Por ler</span>}
                    {message.read && <span className="admin-td-muted">Lida</span>}
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Ver mensagem"
                        disabled={busyId === message.id}
                        onClick={() => handleOpen(message)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Eliminar"
                        disabled={busyId === message.id}
                        onClick={() => setDeletingMessage(message)}
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

      {viewingMessage && (
        <Modal title="Mensagem de contacto" onClose={() => setViewingMessage(null)}>
          <div className="admin-message-view">
            <p>
              <strong>{viewingMessage.name}</strong> · <a href={`mailto:${viewingMessage.email}`}>{viewingMessage.email}</a>
            </p>
            {viewingMessage.subject && <p><strong>Assunto:</strong> {viewingMessage.subject}</p>}
            <p className="admin-td-muted">{formatDateTime(viewingMessage.createdAt)}</p>
            <p style={{ marginTop: 14, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{viewingMessage.message}</p>
          </div>

          <div className="admin-modal-actions">
            <a
              className="admin-btn admin-btn-ghost"
              href={`mailto:${viewingMessage.email}${viewingMessage.subject ? `?subject=Re: ${encodeURIComponent(viewingMessage.subject)}` : ''}`}
            >
              <Mail size={15} />
              Responder por email
            </a>
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              onClick={() => setDeletingMessage(viewingMessage)}
            >
              <Trash2 size={15} />
              Eliminar
            </button>
          </div>
        </Modal>
      )}

      {deletingMessage && (
        <ConfirmDialog
          title="Eliminar mensagem"
          message={`Tens a certeza que queres eliminar a mensagem de "${deletingMessage.name}"?`}
          confirmLabel="Eliminar"
          danger
          busy={busyId === deletingMessage.id}
          onConfirm={handleDelete}
          onCancel={() => setDeletingMessage(null)}
        />
      )}
    </div>
  )
}

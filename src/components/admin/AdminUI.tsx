import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Loader as LoaderIcon, TriangleAlert, X } from 'lucide-react'
import type { EntityStatus } from '../../types/api'

// -----------------------------------------------------------------------
// Pequenos componentes reutilizados em todas as páginas do painel admin.
// -----------------------------------------------------------------------

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="admin-state admin-state-loading">
      <LoaderIcon className="admin-spin" size={20} aria-hidden="true" />
      {label ?? 'A carregar…'}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="admin-state admin-state-error">
      <TriangleAlert size={20} aria-hidden="true" />
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return <div className="admin-state admin-state-empty">{message}</div>
}

export function StatusPill({ status }: { status: EntityStatus }) {
  const labels: Record<EntityStatus, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
  }

  return <span className={`admin-pill admin-pill-${status}`}>{labels[status]}</span>
}

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}

export function Modal({ title, onClose, children, wide }: ModalProps) {
  // Fecha com a tecla Escape, por conveniência.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className={`admin-modal${wide ? ' admin-modal-wide' : ''}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  )
}

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  danger,
  busy,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="admin-confirm-message">{message}</p>

      <div className="admin-modal-actions">
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <button
          type="button"
          className={`admin-btn ${danger ? 'admin-btn-danger' : 'admin-btn-primary'}`}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'A processar…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Envolve as rotas /admin/* que exigem sessão iniciada. Enquanto a sessão
// guardada está a ser validada mostra um ecrã de carregamento simples;
// sem sessão válida, redireciona para o login guardando a página pedida.
export default function ProtectedRoute() {
  const { admin, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="admin-boot-screen">
        <span className="admin-spinner" aria-hidden="true" />
        A verificar sessão…
      </div>
    )
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  FileText,
  Handshake,
  Image as ImageIcon,
  KeyRound,
  Layers,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin', label: 'Resumo', icon: LayoutDashboard, end: true },
  { to: '/admin/clubes', label: 'Clubes', icon: Building2, end: false },
  { to: '/admin/atletas', label: 'Atletas', icon: Users, end: false },
  { to: '/admin/noticias', label: 'Notícias', icon: Newspaper, end: false },
  { to: '/admin/competicoes', label: 'Competições', icon: Trophy, end: false },
  { to: '/admin/resultados', label: 'Resultados', icon: ListOrdered, end: false },
  { to: '/admin/ranking', label: 'Ranking', icon: BarChart3, end: false },
  { to: '/admin/parceiros', label: 'Parceiros', icon: Handshake, end: false },
  { to: '/admin/documentos', label: 'Documentos', icon: FileText, end: false },
  { to: '/admin/galeria', label: 'Galeria', icon: ImageIcon, end: false },
  { to: '/admin/mensagens', label: 'Mensagens', icon: Mail, end: false },
  { to: '/admin/referencia', label: 'Modalidades e categorias', icon: Layers, end: false },
] as const

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className={`admin-shell${menuOpen ? ' admin-shell-menu-open' : ''}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-logo">APSKIB</span>
          <span className="admin-sidebar-subtitle">Administração</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/admin/conta" className="admin-sidebar-user" onClick={() => setMenuOpen(false)}>
            <strong>{admin?.name}</strong>
            <span>{admin?.email}</span>
          </Link>
          <Link
            to="/admin/conta"
            className="admin-btn admin-btn-ghost admin-logout-btn"
            onClick={() => setMenuOpen(false)}
          >
            <KeyRound size={16} aria-hidden="true" />
            Alterar password
          </Link>
          <button type="button" className="admin-btn admin-btn-ghost admin-logout-btn" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Terminar sessão
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <a href="/" className="admin-topbar-site-link">
            Ver site público →
          </a>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

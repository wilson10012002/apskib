import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

const navItems = [
  { label: 'Início', path: '/' },
  { label: 'APSKIB', path: '/apskib' },
  { label: 'Modalidades', path: '/modalidades' },
  { label: 'Competições', path: '/competicoes' },
  { label: 'Atletas', path: '/atletas' },
  { label: 'Clubes', path: '/clubes' },
  { label: 'Formação', path: '/formacao' },
  { label: 'Notícias', path: '/noticias' },
  { label: 'Resultados', path: '/resultados' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="header-container">

        {/* Logo */}
        <Link
          to="/"
          className="logo"
          onClick={() => setMobileOpen(false)}
        >
          <div className="logo-mark">
            APSKIB
          </div>

          <div className="logo-text">
            <strong>APSKIB</strong>
            <span>Sambo & Kurash</span>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="nav-dropdown">
            <button className="nav-link dropdown-button">
              Mais
              <ChevronDown size={15} />
            </button>

            <div className="dropdown-menu">
              <NavLink to="/ranking">
                Ranking
              </NavLink>

              <NavLink to="/multimedia">
                Multimédia
              </NavLink>

              <NavLink to="/parceiros">
                Parceiros
              </NavLink>

              <NavLink to="/documentos">
                Documentos
              </NavLink>

              <NavLink to="/contactos">
                Contactos
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Registration button */}
        <Link
          to="/inscricao"
          className="registration-button"
        >
          Inscreva-se
        </Link>

        {/* Mobile button */}
        <button
          className="mobile-menu-button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Abrir menu"
        >
          {mobileOpen ? (
            <X size={27} />
          ) : (
            <Menu size={27} />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="mobile-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          <NavLink
            to="/ranking"
            className="mobile-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            Ranking
          </NavLink>

          <NavLink
            to="/multimedia"
            className="mobile-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            Multimédia
          </NavLink>

          <NavLink
            to="/documentos"
            className="mobile-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            Documentos
          </NavLink>

          <NavLink
            to="/contactos"
            className="mobile-nav-link"
            onClick={() => setMobileOpen(false)}
          >
            Contactos
          </NavLink>

          <Link
            to="/inscricao"
            className="mobile-registration-button"
            onClick={() => setMobileOpen(false)}
          >
            Inscreva-se
          </Link>
        </div>
      )}
    </header>
  )
}
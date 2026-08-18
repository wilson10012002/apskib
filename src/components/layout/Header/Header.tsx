import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'

import logo from '../../../assets/images/logo.jpeg'

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

const moreItems = [
  { label: 'Ranking', path: '/ranking' },
  { label: 'Multimédia', path: '/multimedia' },
  { label: 'Parceiros', path: '/parceiros' },
  { label: 'Documentos', path: '/documentos' },
  { label: 'Contactos', path: '/contactos' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobileMenu = () => {
    setMobileOpen(false)
  }

  return (
    <header className="site-header">
      <div className="header-container">

        {/* Logo */}
        <Link
          to="/"
          className="logo"
          onClick={closeMobileMenu}
        >
          <img
            src={logo}
            alt="APSKIB - Sambo & Kurash"
            className="logo-image"
          />
        </Link>

        {/* Desktop Navigation */}
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

          {/* Mais */}
          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-link dropdown-button"
            >
              <span>Mais</span>
              <ChevronDown size={15} />
            </button>

            <div className="dropdown-menu">
              {moreItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

        </nav>

        {/* Registration Button */}
        <Link
          to="/inscricao"
          className="registration-button"
        >
          Inscreva-se
        </Link>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={
            mobileOpen
              ? 'Fechar menu'
              : 'Abrir menu'
          }
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X size={27} />
          ) : (
            <Menu size={27} />
          )}
        </button>

      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <nav className="mobile-nav">

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMobileMenu}
            >
              {item.label}
            </NavLink>
          ))}

          {/* Mais - Mobile */}
          {moreItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              {item.label}
            </NavLink>
          ))}

          {/* Mobile Registration */}
          <Link
            to="/inscricao"
            className="mobile-registration-button"
            onClick={closeMobileMenu}
          >
            Inscreva-se
          </Link>

        </nav>
      )}
    </header>
  )
}
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface PageHeroProps {
  eyebrow?: string
  title: string
  description?: string
}

export default function PageHero({
  eyebrow = 'APSKIB',
  title,
  description,
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-container">
        <nav className="breadcrumb" aria-label="Localização atual">
          <Link to="/">Início</Link>
          <ChevronRight size={13} />
          <span>{title}</span>
        </nav>

        <span className="page-hero-eyebrow">{eyebrow}</span>

        <h1>{title}</h1>

        {description && <p>{description}</p>}
      </div>
    </section>
  )
}

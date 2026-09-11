import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays } from 'lucide-react'

import heroImage from '../../../assets/hero.png'
import type { ApiCompetition } from '../../../types/api'

interface HeroProps {
  nextCompetition?: ApiCompetition | null
}

export default function Hero({ nextCompetition }: HeroProps) {
  return (
    <section className="hero">

      <div className="hero-overlay">
        <div className="hero-container">

          <div className="hero-grid">

            <div className="hero-content">

              <span className="hero-label">
                APSKIB • SAMBO & KURASH
              </span>

              <h1>
                Disciplina + Organização
                <br />
                <span>= Resultado</span>
              </h1>

              <p>
                Associação Provincial de Sambo e Kurash
                de Icolo e Bengo.
              </p>

              <p className="hero-description">
                Promovemos o desenvolvimento do desporto,
                a formação de atletas e a realização de
                competições com organização, disciplina
                e excelência.
              </p>

              <div className="hero-buttons">

                <Link
                  to="/inscricao"
                  className="hero-button primary"
                >
                  Inscreva-se
                  <ArrowRight size={15} />
                </Link>

                <Link
                  to="/competicoes"
                  className="hero-button secondary"
                >
                  Calendário de Competições
                </Link>

                <Link
                  to="/apskib"
                  className="hero-link"
                >
                  Conheça a APSKIB →
                </Link>

              </div>

            </div>

            <div className="hero-visual">

              <div className="hero-visual-frame">
                <img
                  src={heroImage}
                  alt="Atletas da APSKIB em competição de Sambo e Kurash"
                />
              </div>

              {nextCompetition && (
                <div className="hero-floating-card">
                  <CalendarDays size={20} />

                  <div>
                    <strong>{nextCompetition.date}</strong>
                    <span>{nextCompetition.title}</span>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>

    </section>
  )
}

import { Link } from 'react-router-dom'
import logo from "../../../assets/images/logo.jpeg"

export default function Hero() {
  return (
    <section className="hero">

      <div className="hero-overlay">
        <div className="hero-container">

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

        </div>
      </div>

    </section>
  )
}
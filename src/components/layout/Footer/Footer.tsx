import { Link } from 'react-router-dom'
import logo from "../../../assets/images/logo.png"

export default function Footer() {
  return (
    <footer className="site-footer">

      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">

        

        <h3>
            Associação Provincial de
            <br />
            Sambo e Kurash do Icolo e Bengo
        </h3>

          <p className="footer-slogan">
            Disciplina + Organização = Resultado
          </p>
        </div>

        {/* Links */}
        <div className="footer-column">
          <h4>APSKIB</h4>

          <Link to="/apskib">
            Sobre nós
          </Link>

          <Link to="/modalidades">
            Modalidades
          </Link>

          <Link to="/competicoes">
            Competições
          </Link>

          <Link to="/atletas">
            Atletas
          </Link>

          <Link to="/clubes">
            Clubes
          </Link>
        </div>

        {/* Links */}
        <div className="footer-column">
          <h4>Informação</h4>

          <Link to="/noticias">
            Notícias
          </Link>

          <Link to="/resultados">
            Resultados
          </Link>

          <Link to="/ranking">
            Ranking
          </Link>

          <Link to="/formacao">
            Formação
          </Link>

          <Link to="/documentos">
            Documentos
          </Link>
        </div>

        {/* Contactos */}
        <div className="footer-column footer-contact">
          <h4>Contactos</h4>

          <p>
            map
            <span>
              Zango II, Calumbo
              <br />
              Icolo e Bengo, Angola
            </span>
          </p>

          <p>
            p
            <span>
              +244 924 718 752
              <br />
              +244 953 270 383
            </span>
          </p>

          <p>
            m
            <span>
              apskibengo@gmail.com
            </span>
          </p>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} APSKIB.
          Todos os direitos reservados.
        </p>

        <div className="social-links">
          <a href="#" aria-label="Facebook">
            f
          </a>

          <a href="#" aria-label="Instagram">
            i
          </a>

          <a href="#" aria-label="YouTube">
            y
          </a>
        </div>

      </div>
    </footer>
  )
}
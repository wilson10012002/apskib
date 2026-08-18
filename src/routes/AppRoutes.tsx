import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home/Home'

function About() {
  return <h1>Sobre a APSKIB</h1>
}

function Sports() {
  return <h1>Modalidades</h1>
}

function Competitions() {
  return <h1>Competições</h1>
}

function Athletes() {
  return <h1>Atletas</h1>
}

function Clubs() {
  return <h1>Clubes</h1>
}

function Training() {
  return <h1>Formação</h1>
}

function News() {
  return <h1>Notícias</h1>
}

function Results() {
  return <h1>Resultados</h1>
}

function Ranking() {
  return <h1>Ranking</h1>
}

function Media() {
  return <h1>Multimédia</h1>
}

function Partners() {
  return <h1>Parceiros</h1>
}

function Documents() {
  return <h1>Documentos</h1>
}

function Contacts() {
  return <h1>Contactos</h1>
}

function Registration() {
  return <h1>Inscrição</h1>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/apskib" element={<About />} />
      <Route path="/modalidades" element={<Sports />} />
      <Route path="/competicoes" element={<Competitions />} />
      <Route path="/atletas" element={<Athletes />} />
      <Route path="/clubes" element={<Clubs />} />
      <Route path="/formacao" element={<Training />} />
      <Route path="/noticias" element={<News />} />
      <Route path="/resultados" element={<Results />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/multimedia" element={<Media />} />
      <Route path="/parceiros" element={<Partners />} />
      <Route path="/documentos" element={<Documents />} />
      <Route path="/contactos" element={<Contacts />} />
      <Route path="/inscricao" element={<Registration />} />
    </Routes>
  )
}
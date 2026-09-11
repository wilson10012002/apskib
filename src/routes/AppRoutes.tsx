import { Routes, Route } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout'
import Home from '../pages/Home/Home'
import About from '../pages/About/About'
import Sports from '../pages/Sports/Sports'
import Competitions from '../pages/Competitions/Competitions'
import Athletes from '../pages/Athletes/Athletes'
import Clubs from '../pages/Clubs/Clubs'
import Training from '../pages/Training/Training'
import News from '../pages/News/News'
import NewsDetail from '../pages/NewsDetail/NewsDetail'
import Results from '../pages/Results/Results'
import Ranking from '../pages/Ranking/Ranking'
import Media from '../pages/Media/Media'
import Partners from '../pages/Partners/Partners'
import Documents from '../pages/Documents/Documents'
import Contacts from '../pages/Contacts/Contacts'
import Registration from '../pages/Registration/Registration'

import ProtectedRoute from '../components/admin/ProtectedRoute'
import AdminLogin from '../pages/Admin/Login/Login'
import AdminLayout from '../pages/Admin/AdminLayout'
import AdminDashboard from '../pages/Admin/Dashboard/Dashboard'
import AdminClubs from '../pages/Admin/Clubs/ClubsAdmin'
import AdminAthletes from '../pages/Admin/Athletes/AthletesAdmin'
import AdminNews from '../pages/Admin/News/NewsAdmin'
import AdminCompetitions from '../pages/Admin/Competitions/CompetitionsAdmin'
import AdminResults from '../pages/Admin/Results/ResultsAdmin'
import AdminRanking from '../pages/Admin/Ranking/RankingAdmin'
import AdminPartners from '../pages/Admin/Partners/PartnersAdmin'
import AdminDocuments from '../pages/Admin/Documents/DocumentsAdmin'
import AdminGallery from '../pages/Admin/Gallery/GalleryAdmin'
import AdminContact from '../pages/Admin/Contact/ContactAdmin'
import AdminReference from '../pages/Admin/Reference/ReferenceAdmin'
import AdminAccount from '../pages/Admin/Account/Account'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/apskib" element={<About />} />
        <Route path="/modalidades" element={<Sports />} />
        <Route path="/competicoes" element={<Competitions />} />
        <Route path="/atletas" element={<Athletes />} />
        <Route path="/clubes" element={<Clubs />} />
        <Route path="/formacao" element={<Training />} />
        <Route path="/noticias" element={<News />} />
        <Route path="/noticias/:slug" element={<NewsDetail />} />
        <Route path="/resultados" element={<Results />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/multimedia" element={<Media />} />
        <Route path="/parceiros" element={<Partners />} />
        <Route path="/documentos" element={<Documents />} />
        <Route path="/contactos" element={<Contacts />} />
        <Route path="/inscricao" element={<Registration />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="clubes" element={<AdminClubs />} />
          <Route path="atletas" element={<AdminAthletes />} />
          <Route path="noticias" element={<AdminNews />} />
          <Route path="competicoes" element={<AdminCompetitions />} />
          <Route path="resultados" element={<AdminResults />} />
          <Route path="ranking" element={<AdminRanking />} />
          <Route path="parceiros" element={<AdminPartners />} />
          <Route path="documentos" element={<AdminDocuments />} />
          <Route path="galeria" element={<AdminGallery />} />
          <Route path="mensagens" element={<AdminContact />} />
          <Route path="referencia" element={<AdminReference />} />
          <Route path="conta" element={<AdminAccount />} />
        </Route>
      </Route>
    </Routes>
  )
}

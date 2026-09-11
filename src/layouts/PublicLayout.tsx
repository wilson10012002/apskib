import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header/Header'
import Footer from '../components/layout/Footer/Footer'

// Layout usado por todas as páginas públicas do site (com cabeçalho e rodapé).
// O painel de administração usa o seu próprio layout (ver pages/Admin/AdminLayout).
export default function PublicLayout() {
  return (
    <div className="app">
      <Header />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

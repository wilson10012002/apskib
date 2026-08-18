import Header from './components/layout/Header/Header'
import Footer from './components/layout/Footer/Footer'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <div className="app">
      <Header />

      <main>
        <AppRoutes />
      </main>

      <Footer />
    </div>
  )
}

export default App
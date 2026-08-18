import Hero from '../../components/home/Hero/Hero'
import SportsAndCategories from '../../components/home/SportsAndCategories/SportsAndCategories'

export default function Home() {
  return (
    <>
      <Hero />

      <SportsAndCategories />

      <section className="home-placeholder">
        <div>
          <span>APSKIB</span>

          <h2>Próximas Competições</h2>

          <p>
            Em breve poderá consultar aqui
            todas as competições da APSKIB.
          </p>
        </div>
      </section>
    </>
  )
}
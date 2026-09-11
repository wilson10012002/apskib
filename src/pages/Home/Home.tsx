import Hero from '../../components/home/Hero/Hero'
import SportsAndCategories from '../../components/home/SportsAndCategories/SportsAndCategories'
import UpcomingCompetitions from '../../components/home/upcomingCompetitions/UpcomingCompetitions'
import { useFetch } from '../../hooks/useFetch'
import { competitionsApi } from '../../lib/api'

export default function Home() {
  const { data: competitions, loading, error } = useFetch(competitionsApi.list, [])

  return (
    <>
      <Hero nextCompetition={competitions?.[0]} />

      <SportsAndCategories />

      <UpcomingCompetitions competitions={competitions} loading={loading} error={error} />
    </>
  )
}

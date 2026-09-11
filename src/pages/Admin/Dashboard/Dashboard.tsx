import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Mail, Newspaper, Trophy, Users } from 'lucide-react'
import { useFetch } from '../../../hooks/useFetch'
import {
  athletesAdminApi,
  clubsAdminApi,
  competitionsApi,
  contactAdminApi,
  newsAdminApi,
} from '../../../lib/api'
import { ErrorState, Spinner } from '../../../components/admin/AdminUI'

interface DashboardData {
  pendingClubs: number
  pendingAthletes: number
  unreadMessages: number
  draftNews: number
  upcomingCompetitions: number
}

async function loadDashboardData(): Promise<DashboardData> {
  const [pendingClubs, pendingAthletes, unreadMessages, allNews, competitions] = await Promise.all([
    clubsAdminApi.list('pending'),
    athletesAdminApi.list({ status: 'pending' }),
    contactAdminApi.list(true),
    newsAdminApi.list(),
    competitionsApi.list(),
  ])

  return {
    pendingClubs: pendingClubs.length,
    pendingAthletes: pendingAthletes.length,
    unreadMessages: unreadMessages.length,
    draftNews: allNews.filter((post) => !post.publishedAt).length,
    upcomingCompetitions: competitions.filter((competition) => competition.status === 'scheduled').length,
  }
}

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(loadDashboardData, [])

  const stats = useMemo(
    () => [
      { label: 'Clubes pendentes', value: data?.pendingClubs, icon: Building2, to: '/admin/clubes' },
      { label: 'Atletas pendentes', value: data?.pendingAthletes, icon: Users, to: '/admin/atletas' },
      { label: 'Mensagens por ler', value: data?.unreadMessages, icon: Mail, to: '/admin/mensagens' },
      { label: 'Notícias em rascunho', value: data?.draftNews, icon: Newspaper, to: '/admin/noticias' },
      {
        label: 'Competições agendadas',
        value: data?.upcomingCompetitions,
        icon: Trophy,
        to: '/admin/competicoes',
      },
    ],
    [data],
  )

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Resumo</h1>
          <p>Vista geral do que precisa da tua atenção.</p>
        </div>
      </div>

      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="admin-stats-grid">
          {stats.map(({ label, value, icon: Icon, to }) => (
            <Link key={label} to={to} className="admin-stat-card">
              <span className="admin-stat-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <strong>{value ?? 0}</strong>
                <span>{label}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="admin-dashboard-section">
        <h2>Acesso rápido</h2>
        <div className="admin-quick-links">
          <Link to="/admin/referencia" className="admin-quick-link">
            Modalidades e categorias
          </Link>
          <Link to="/admin/parceiros" className="admin-quick-link">
            Parceiros
          </Link>
          <Link to="/admin/documentos" className="admin-quick-link">
            Documentos
          </Link>
          <Link to="/admin/galeria" className="admin-quick-link">
            Galeria
          </Link>
        </div>
      </div>
    </div>
  )
}

// Tipos que espelham as respostas da API do backend (ver apskib-backend).

export type SportColor = 'red' | 'blue' | 'green'

export interface ApiSport {
  id: string
  slug: string
  name: string
  color: SportColor
  description: string
  rules: string[]
  order: number
}

export interface ApiCategory {
  id: string
  slug: string
  label: string
  ageRange: string
  order: number
}

export type CompetitionStatus = 'scheduled' | 'completed'

export interface ApiCompetition {
  id: string
  title: string
  date: string
  location: string
  categoryLabel: string
  status: CompetitionStatus
}

export interface ApiClub {
  id: string
  name: string
  city?: string | null
  logoUrl?: string | null
}

export interface ApiAthlete {
  id: string
  fullName: string
  club: string | null
  category: string | null
  sports: { name: string; slug: string }[]
}

export interface ApiNewsPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImageUrl?: string | null
  published: boolean
  publishedAt: string | null
}

export interface ApiResult {
  id: string
  competitionId: string
  athleteName: string
  position: number
  notes?: string | null
  competition?: ApiCompetition
  sport?: ApiSport | null
  category?: ApiCategory | null
}

export interface ApiRankingEntry {
  id: string
  athleteName: string
  clubName?: string | null
  points: number
  category?: ApiCategory | null
}

export interface ApiPartner {
  id: string
  name: string
  logoUrl?: string | null
  website?: string | null
  order: number
}

export interface ApiDocument {
  id: string
  title: string
  description?: string | null
  category: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedAt: string
}

export interface ApiGalleryImage {
  id: string
  url: string
  caption?: string | null
  featured: boolean
  order: number
}

export interface RegistrationPayload {
  fullName: string
  birthDate: string
  gender: string
  phone: string
  email: string
  clubName?: string
  categoryId: string
  competitionId: string
  sportIds: string[]
  acceptedTerms: true
}

export interface ContactPayload {
  name: string
  email: string
  subject?: string
  message: string
}

// -----------------------------------------------------------------------
// Autenticação e tipos usados apenas no painel de administração
// -----------------------------------------------------------------------

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AdminUser
}

export type EntityStatus = 'pending' | 'approved' | 'rejected'

export interface ApiAdminClub {
  id: string
  name: string
  city?: string | null
  contactName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  logoUrl?: string | null
  status: EntityStatus
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface ClubInput {
  name?: string
  city?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  logoUrl?: string
  notes?: string
}

export interface ApiAdminAthlete {
  id: string
  fullName: string
  birthDate: string
  gender: string
  phone: string
  email: string
  status: EntityStatus
  acceptedTerms: boolean
  notes?: string | null
  createdAt: string
  updatedAt: string
  clubId?: string | null
  club?: ApiAdminClub | null
  clubName?: string | null
  categoryId?: string | null
  category?: ApiCategory | null
  competitionId?: string | null
  competition?: ApiCompetition | null
  sports: { sport: ApiSport }[]
}

export interface AthleteInput {
  fullName?: string
  gender?: string
  phone?: string
  email?: string
  clubId?: string | null
  clubName?: string | null
  categoryId?: string | null
  competitionId?: string | null
  notes?: string | null
  sportIds?: string[]
}

export interface NewsInput {
  title: string
  slug?: string
  excerpt: string
  content: string
  coverImageUrl?: string
  published?: boolean
}

export interface CompetitionInput {
  title: string
  date: string
  location: string
  categoryLabel: string
  status?: CompetitionStatus
}

export interface ResultInput {
  competitionId: string
  sportId?: string
  categoryId?: string
  athleteId?: string
  athleteName: string
  position: number
  notes?: string
}

export interface RankingInput {
  athleteId?: string
  athleteName: string
  clubName?: string
  points: number
  categoryId?: string
}

export interface PartnerInput {
  name: string
  website?: string
  order?: number
}

export interface DocumentInput {
  title: string
  description?: string
  category: string
}

export interface GalleryInput {
  caption?: string
  featured?: boolean
  order?: number
}

export interface ApiContactMessage {
  id: string
  name: string
  email: string
  subject?: string | null
  message: string
  read: boolean
  createdAt: string
}

export interface SportInput {
  slug: string
  name: string
  color: SportColor
  description: string
  rules?: string[]
  order?: number
}

export interface CategoryInput {
  slug: string
  label: string
  ageRange: string
  order?: number
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

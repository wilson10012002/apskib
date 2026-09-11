import axios from 'axios'
import type {
  AdminUser,
  ApiAdminAthlete,
  ApiAdminClub,
  ApiAthlete,
  ApiCategory,
  ApiClub,
  ApiCompetition,
  ApiContactMessage,
  ApiDocument,
  ApiGalleryImage,
  ApiNewsPost,
  ApiPartner,
  ApiRankingEntry,
  ApiResult,
  ApiSport,
  AthleteInput,
  CategoryInput,
  ChangePasswordPayload,
  ClubInput,
  CompetitionInput,
  ContactPayload,
  DocumentInput,
  EntityStatus,
  GalleryInput,
  LoginPayload,
  LoginResponse,
  NewsInput,
  RankingInput,
  RegistrationPayload,
  ResultInput,
  SportInput,
} from '../types/api'

// Em desenvolvimento, se não houver VITE_API_URL definida, assume-se que o
// backend corre na mesma máquina/endereço a partir de onde a página foi
// carregada, na porta 4000 (ver apskib-backend/README.md). Isto permite
// aceder ao site a partir de outro dispositivo na mesma rede (ex:
// http://192.168.x.x:5173) sem precisar de mudar o .env manualmente —
// se tivesses "localhost" fixo, o pedido tentaria contactar o próprio
// dispositivo que abriu a página, não o computador onde o backend corre.
const inferredApiBase = `http://${window.location.hostname}:4000/api`
const baseURL = import.meta.env.VITE_API_URL ?? inferredApiBase

export const api = axios.create({ baseURL })

const TOKEN_STORAGE_KEY = 'apskib_admin_token'

// Aplica (ou remove) o token JWT em todos os pedidos seguintes feitos com
// esta instância do axios. Usado pelo AuthContext do painel de administração.
export function setAuthToken(token: string | null): void {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export function getStoredAuthToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function storeAuthToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    // localStorage pode estar indisponível (modo privado, etc.) — o login
    // continua a funcionar durante a sessão, só não persiste ao recarregar.
  }
}

export function clearStoredAuthToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // ver comentário acima
  }
}

// Mensagem de erro amigável a partir de uma resposta de erro da API.
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error?.message
    if (typeof message === 'string') return message

    if (error.code === 'ERR_NETWORK') {
      return 'Não foi possível contactar o servidor. Verifique a sua ligação e tente novamente.'
    }
  }

  return fallback
}

export const sportsApi = {
  list: () => api.get<ApiSport[]>('/sports').then((res) => res.data),
}

export const categoriesApi = {
  list: () => api.get<ApiCategory[]>('/categories').then((res) => res.data),
}

export const competitionsApi = {
  list: () => api.get<ApiCompetition[]>('/competitions').then((res) => res.data),
}

export const clubsApi = {
  list: () => api.get<ApiClub[]>('/clubs').then((res) => res.data),
}

export const athletesApi = {
  list: () => api.get<ApiAthlete[]>('/athletes').then((res) => res.data),
}

export const registrationsApi = {
  create: (payload: RegistrationPayload) =>
    api.post<{ message: string }>('/registrations', payload).then((res) => res.data),
}

export const resultsApi = {
  list: (competitionId?: string) =>
    api
      .get<ApiResult[]>('/results', { params: competitionId ? { competitionId } : undefined })
      .then((res) => res.data),
}

export const rankingApi = {
  list: (categoryId?: string) =>
    api
      .get<ApiRankingEntry[]>('/ranking', { params: categoryId ? { categoryId } : undefined })
      .then((res) => res.data),
}

export const newsApi = {
  list: () => api.get<ApiNewsPost[]>('/news').then((res) => res.data),
  bySlug: (slug: string) => api.get<ApiNewsPost>(`/news/${slug}`).then((res) => res.data),
}

export const partnersApi = {
  list: () => api.get<ApiPartner[]>('/partners').then((res) => res.data),
}

export const documentsApi = {
  list: () => api.get<ApiDocument[]>('/documents').then((res) => res.data),
}

export const galleryApi = {
  list: () => api.get<ApiGalleryImage[]>('/gallery').then((res) => res.data),
}

export const contactApi = {
  send: (payload: ContactPayload) =>
    api.post<{ message: string }>('/contact', payload).then((res) => res.data),
}

// -----------------------------------------------------------------------
// Painel de administração — requer token (ver AuthContext / setAuthToken)
// -----------------------------------------------------------------------

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload).then((res) => res.data),
  me: () => api.get<AdminUser>('/auth/me').then((res) => res.data),
  changePassword: (payload: ChangePasswordPayload) =>
    api.patch<{ message: string }>('/auth/password', payload).then((res) => res.data),
}

export const clubsAdminApi = {
  list: (status?: EntityStatus) =>
    api
      .get<ApiAdminClub[]>('/admin/clubs', { params: status ? { status } : undefined })
      .then((res) => res.data),
  update: (id: string, payload: ClubInput) =>
    api.put<ApiAdminClub>(`/admin/clubs/${id}`, payload).then((res) => res.data),
  setStatus: (id: string, status: EntityStatus) =>
    api.patch<ApiAdminClub>(`/admin/clubs/${id}/status`, { status }).then((res) => res.data),
  remove: (id: string) => api.delete(`/admin/clubs/${id}`).then(() => undefined),
}

export interface AthletesAdminListParams {
  status?: EntityStatus
  competitionId?: string
}

export const athletesAdminApi = {
  list: (params?: AthletesAdminListParams) =>
    api.get<ApiAdminAthlete[]>('/admin/athletes', { params }).then((res) => res.data),
  update: (id: string, payload: AthleteInput) =>
    api.put<ApiAdminAthlete>(`/admin/athletes/${id}`, payload).then((res) => res.data),
  setStatus: (id: string, status: EntityStatus) =>
    api.patch<ApiAdminAthlete>(`/admin/athletes/${id}/status`, { status }).then((res) => res.data),
  remove: (id: string) => api.delete(`/admin/athletes/${id}`).then(() => undefined),
}

export const newsAdminApi = {
  list: () => api.get<ApiNewsPost[]>('/admin/news').then((res) => res.data),
  create: (payload: NewsInput) =>
    api.post<ApiNewsPost>('/admin/news', payload).then((res) => res.data),
  update: (id: string, payload: Partial<NewsInput>) =>
    api.put<ApiNewsPost>(`/admin/news/${id}`, payload).then((res) => res.data),
  remove: (id: string) => api.delete(`/admin/news/${id}`).then(() => undefined),
}

export const contactAdminApi = {
  list: (unreadOnly?: boolean) =>
    api
      .get<ApiContactMessage[]>('/admin/contact', { params: unreadOnly ? { unread: 'true' } : undefined })
      .then((res) => res.data),
  markRead: (id: string) =>
    api.patch<ApiContactMessage>(`/admin/contact/${id}/read`).then((res) => res.data),
  remove: (id: string) => api.delete(`/admin/contact/${id}`).then(() => undefined),
}

export const competitionsAdminApi = {
  create: (payload: CompetitionInput) =>
    api.post<ApiCompetition>('/competitions', payload).then((res) => res.data),
  update: (id: string, payload: Partial<CompetitionInput>) =>
    api.put<ApiCompetition>(`/competitions/${id}`, payload).then((res) => res.data),
  remove: (id: string) => api.delete(`/competitions/${id}`).then(() => undefined),
}

export const resultsAdminApi = {
  create: (payload: ResultInput) =>
    api.post<ApiResult>('/results', payload).then((res) => res.data),
  update: (id: string, payload: Partial<ResultInput>) =>
    api.put<ApiResult>(`/results/${id}`, payload).then((res) => res.data),
  remove: (id: string) => api.delete(`/results/${id}`).then(() => undefined),
}

export const rankingAdminApi = {
  create: (payload: RankingInput) =>
    api.post<ApiRankingEntry>('/ranking', payload).then((res) => res.data),
  update: (id: string, payload: Partial<RankingInput>) =>
    api.put<ApiRankingEntry>(`/ranking/${id}`, payload).then((res) => res.data),
  remove: (id: string) => api.delete(`/ranking/${id}`).then(() => undefined),
}

export const partnersAdminApi = {
  create: (formData: FormData) =>
    api
      .post<ApiPartner>('/partners', formData)
      .then((res) => res.data),
  update: (id: string, formData: FormData) =>
    api
      .put<ApiPartner>(`/partners/${id}`, formData)
      .then((res) => res.data),
  remove: (id: string) => api.delete(`/partners/${id}`).then(() => undefined),
}

export const documentsAdminApi = {
  create: (formData: FormData) =>
    api
      .post<ApiDocument>('/documents', formData)
      .then((res) => res.data),
  update: (id: string, payload: Partial<DocumentInput>) =>
    api.put<ApiDocument>(`/documents/${id}`, payload).then((res) => res.data),
  remove: (id: string) => api.delete(`/documents/${id}`).then(() => undefined),
}

export const galleryAdminApi = {
  create: (formData: FormData) =>
    api
      .post<ApiGalleryImage>('/gallery', formData)
      .then((res) => res.data),
  update: (id: string, payload: Partial<GalleryInput>) =>
    api.put<ApiGalleryImage>(`/gallery/${id}`, payload).then((res) => res.data),
  remove: (id: string) => api.delete(`/gallery/${id}`).then(() => undefined),
}

export const sportsAdminApi = {
  create: (payload: SportInput) => api.post<ApiSport>('/sports', payload).then((res) => res.data),
  update: (id: string, payload: Partial<SportInput>) =>
    api.put<ApiSport>(`/sports/${id}`, payload).then((res) => res.data),
  remove: (id: string) => api.delete(`/sports/${id}`).then(() => undefined),
}

export const categoriesAdminApi = {
  create: (payload: CategoryInput) =>
    api.post<ApiCategory>('/categories', payload).then((res) => res.data),
  update: (id: string, payload: Partial<CategoryInput>) =>
    api.put<ApiCategory>(`/categories/${id}`, payload).then((res) => res.data),
  remove: (id: string) => api.delete(`/categories/${id}`).then(() => undefined),
}

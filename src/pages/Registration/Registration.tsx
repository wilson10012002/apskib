import { useState, type FormEvent } from 'react'
import { Send, CheckCircle2, CalendarX } from 'lucide-react'
import PageHero from '../../components/common/PageHero/PageHero'
import { useFetch } from '../../hooks/useFetch'
import { sportsApi, categoriesApi, competitionsApi, registrationsApi, getApiErrorMessage } from '../../lib/api'

export default function Registration() {
  const { data: sports, loading: loadingSports } = useFetch(sportsApi.list, [])
  const { data: categories, loading: loadingCategories } = useFetch(categoriesApi.list, [])
  const { data: competitions, loading: loadingCompetitions } = useFetch(competitionsApi.list, [])

  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [club, setClub] = useState('')
  const [competitionId, setCompetitionId] = useState('')
  const [samboSportId, setSamboSportId] = useState('')
  const [kurash, setKurash] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const samboOptions = sports?.filter((sport) => sport.slug !== 'kurash') ?? []
  const kurashSport = sports?.find((sport) => sport.slug === 'kurash')
  const scheduledCompetitions = competitions?.filter((competition) => competition.status === 'scheduled') ?? []

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    const sportIds = [samboSportId, kurash ? kurashSport?.id : undefined].filter(
      (id): id is string => Boolean(id),
    )

    if (sportIds.length === 0) {
      setSubmitError('Escolha pelo menos uma modalidade.')
      return
    }

    setSubmitting(true)

    try {
      await registrationsApi.create({
        fullName,
        birthDate,
        gender,
        phone,
        email,
        clubName: club || undefined,
        categoryId,
        competitionId,
        sportIds,
        acceptedTerms: true,
      })
      setSubmitted(true)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Não foi possível submeter a inscrição. Tente novamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <>
        <PageHero title="Inscrição" description="Inscrição de atletas na APSKIB." />

        <section className="page-section">
          <div className="section-container">
            <div className="empty-state">
              <div className="icon-badge large success">
                <CheckCircle2 size={28} />
              </div>

              <span>APSKIB</span>
              <h2>Inscrição recebida com sucesso</h2>
              <p>
                Os seus dados foram enviados à APSKIB. A sua inscrição será
                validada em breve — receberá confirmação através do contacto
                indicado.
              </p>
            </div>
          </div>
        </section>
      </>
    )
  }

  // Sem competições agendadas de momento: não há para onde inscrever
  // ninguém, por isso mostramos um estado vazio em vez do formulário.
  if (!loadingCompetitions && scheduledCompetitions.length === 0) {
    return (
      <>
        <PageHero
          title="Inscrição"
          description="Preencha a ficha para se inscrever como atleta da APSKIB."
        />

        <section className="page-section">
          <div className="section-container">
            <div className="empty-state">
              <div className="icon-badge large">
                <CalendarX size={28} />
              </div>

              <span>APSKIB</span>
              <h2>Sem inscrições abertas de momento</h2>
              <p>
                Não há nenhuma competição agendada a aceitar inscrições neste
                momento. Consulte a página de Competições para acompanhar o
                próximo calendário.
              </p>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHero
        title="Inscrição"
        description="Preencha a ficha para se inscrever como atleta da APSKIB."
      />

      <section className="page-section">
        <div className="section-container narrow">
          <form className="form-card" onSubmit={handleSubmit}>
            <h3>Competição</h3>

            <div className="form-group">
              <label htmlFor="reg-competition">Competição em que se vai inscrever</label>
              <select
                id="reg-competition"
                required
                disabled={loadingCompetitions}
                value={competitionId}
                onChange={(e) => setCompetitionId(e.target.value)}
              >
                <option value="">{loadingCompetitions ? 'A carregar…' : 'Selecione'}</option>
                {scheduledCompetitions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.title} — {competition.date}
                  </option>
                ))}
              </select>
            </div>

            <h3>Dados do atleta</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-name">Nome completo</label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-birth">Data de nascimento</label>
                <input
                  id="reg-birth"
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-gender">Género</label>
                <select
                  id="reg-gender"
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="reg-category">Categoria</label>
                <select
                  id="reg-category"
                  required
                  disabled={loadingCategories}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">{loadingCategories ? 'A carregar…' : 'Selecione'}</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label} ({cat.ageRange})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-phone">Contacto telefónico</label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-club">Clube (opcional)</label>
              <input
                id="reg-club"
                type="text"
                placeholder="Deixe em branco se for atleta independente"
                value={club}
                onChange={(e) => setClub(e.target.value)}
              />
            </div>

            <fieldset className="form-fieldset">
              <legend>Modalidade</legend>

              <p className="form-hint">
                Escolha uma modalidade de Sambo. O Kurash pode ser
                adicionado como segunda modalidade.
              </p>

              {loadingSports ? (
                <p className="form-hint">A carregar modalidades…</p>
              ) : (
                <>
                  <div className="radio-group">
                    {samboOptions.map((sport) => (
                      <label className="radio-option" key={sport.id}>
                        <input
                          type="radio"
                          name="sambo"
                          value={sport.id}
                          checked={samboSportId === sport.id}
                          onChange={(e) => setSamboSportId(e.target.value)}
                          required
                        />
                        {sport.name}
                      </label>
                    ))}
                  </div>

                  {kurashSport && (
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={kurash}
                        onChange={(e) => setKurash(e.target.checked)}
                      />
                      {kurashSport.name}
                    </label>
                  )}
                </>
              )}
            </fieldset>

            <label className="checkbox-option">
              <input
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              Aceito o regulamento da APSKIB e autorizo o tratamento dos
              meus dados para fins de inscrição.
            </label>

            {submitError && <p className="form-error">{submitError}</p>}

            <button type="submit" className="form-submit" disabled={submitting}>
              <Send size={16} />
              {submitting ? 'A submeter…' : 'Submeter inscrição'}
            </button>
          </form>
        </div>
      </section>
    </>
  )
}

import { useState, type FormEvent } from 'react'
import { MapPin, Phone, Mail, Send, CheckCircle2 } from 'lucide-react'
import PageHero from '../../components/common/PageHero/PageHero'
import { contactInfo } from '../../data/content'
import { contactApi, getApiErrorMessage } from '../../lib/api'

export default function Contacts() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)
    setSubmitting(true)

    try {
      await contactApi.send({ name, email, subject: subject || undefined, message })
      setSent(true)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Não foi possível enviar a mensagem. Tente novamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    contactInfo.mapsQuery,
  )}`

  return (
    <>
      <PageHero
        title="Contactos"
        description="Entre em contacto com a APSKIB."
      />

      <section className="page-section">
        <div className="section-container contacts-layout">
          <div className="contact-info-list">
            <div className="contact-info-card">
              <MapPin size={20} />

              <div>
                <h3>Morada</h3>
                {contactInfo.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <a href={mapsUrl} target="_blank" rel="noreferrer">
                  Ver no mapa
                </a>
              </div>
            </div>

            <div className="contact-info-card">
              <Phone size={20} />

              <div>
                <h3>Telefone</h3>
                {contactInfo.phones.map((phone) => (
                  <p key={phone}>
                    <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
                  </p>
                ))}
              </div>
            </div>

            <div className="contact-info-card">
              <Mail size={20} />

              <div>
                <h3>Email</h3>
                <p>
                  <a href={`mailto:${contactInfo.email}`}>
                    {contactInfo.email}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {sent ? (
            <div className="empty-state">
              <div className="icon-badge large success">
                <CheckCircle2 size={28} />
              </div>

              <span>APSKIB</span>
              <h2>Mensagem enviada</h2>
              <p>Obrigado pelo contacto — responderemos assim que possível.</p>
            </div>
          ) : (
            <form className="form-card" onSubmit={handleSubmit}>
              <h3>Envie-nos uma mensagem</h3>

              <div className="form-group">
                <label htmlFor="contact-name">Nome</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">Assunto</label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Mensagem</label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {submitError && <p className="form-error">{submitError}</p>}

              <button type="submit" className="form-submit" disabled={submitting}>
                <Send size={16} />
                {submitting ? 'A enviar…' : 'Enviar mensagem'}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}

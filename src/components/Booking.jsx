import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { business, formatPrice, schedule, services, team } from '../data/site'
import Button from './ui/Button'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const emptyForm = {
  name: '',
  phone: '',
  service: services[0].id,
  barber: 'cualquiera',
  date: '',
  time: '',
  notes: '',
}

const fieldClass =
  'w-full border border-line bg-surface px-4 py-3 font-sans text-sm text-bone ' +
  'transition-colors duration-300 placeholder:text-muted/60 ' +
  'focus:border-brass focus:outline-none'

const labelClass =
  'font-sans text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted'

function Field({ id, label, className = '', children }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  )
}

export default function Booking() {
  const [form, setForm] = useState(emptyForm)
  const [sent, setSent] = useState(false)

  const today = new Date()
  const todayName = DAYS[today.getDay()]
  const minDate = today.toISOString().slice(0, 10)

  const update = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }))

  // Sin backend todavía: componemos la reserva como mensaje de WhatsApp.
  const handleSubmit = (event) => {
    event.preventDefault()
    const service = services.find((s) => s.id === form.service)
    const barber = team.find((b) => b.id === form.barber)

    const message = [
      `Hola ${business.name}, quiero sacar un turno.`,
      `Nombre: ${form.name}`,
      `Teléfono: ${form.phone}`,
      `Servicio: ${service.name} (${formatPrice(service.price)})`,
      `Barbero: ${barber ? barber.name : 'el primero que esté libre'}`,
      `Día y hora: ${form.date} a las ${form.time}`,
      form.notes && `Notas: ${form.notes}`,
    ]
      .filter(Boolean)
      .join('\n')

    window.open(
      `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener',
    )
    setSent(true)
    setForm(emptyForm)
  }

  return (
    <section id="reserva" className="border-b border-line bg-coal">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 lg:grid-cols-12 lg:gap-20 lg:px-10 lg:py-32">
        <div className="lg:col-span-7">
          <SectionHeading
            index="06"
            eyebrow="Tu turno"
            title="Sacá tu turno"
            subtitle="Completá los datos y te confirmamos por WhatsApp en un rato."
          />

          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit} className="mt-12 grid gap-5 sm:grid-cols-2">
              <Field id="name" label="Nombre">
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Cómo te llamás"
                  className={fieldClass}
                  value={form.name}
                  onChange={update('name')}
                />
              </Field>

              <Field id="phone" label="Teléfono">
                <input
                  id="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="11 2222 3333"
                  className={fieldClass}
                  value={form.phone}
                  onChange={update('phone')}
                />
              </Field>

              <Field id="service" label="Servicio">
                <select
                  id="service"
                  className={fieldClass}
                  value={form.service}
                  onChange={update('service')}
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id} className="bg-surface">
                      {service.name} — {formatPrice(service.price)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="barber" label="Barbero">
                <select
                  id="barber"
                  className={fieldClass}
                  value={form.barber}
                  onChange={update('barber')}
                >
                  <option value="cualquiera" className="bg-surface">
                    El que esté libre
                  </option>
                  {team.map((member) => (
                    <option key={member.id} value={member.id} className="bg-surface">
                      {member.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="date" label="Día">
                <input
                  id="date"
                  type="date"
                  required
                  min={minDate}
                  className={`${fieldClass} [color-scheme:dark]`}
                  value={form.date}
                  onChange={update('date')}
                />
              </Field>

              <Field id="time" label="Hora">
                <input
                  id="time"
                  type="time"
                  required
                  className={`${fieldClass} [color-scheme:dark]`}
                  value={form.time}
                  onChange={update('time')}
                />
              </Field>

              <Field
                id="notes"
                label="Algo que debamos saber (opcional)"
                className="sm:col-span-2"
              >
                <textarea
                  id="notes"
                  rows="3"
                  placeholder="Alergias, referencia de corte, si venís con un chico…"
                  className={`${fieldClass} resize-none`}
                  value={form.notes}
                  onChange={update('notes')}
                />
              </Field>

              <div className="sm:col-span-2">
                <Button type="submit">Enviar solicitud</Button>
              </div>

              <AnimatePresence>
                {sent && (
                  <motion.p
                    role="status"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="border-l-2 border-brass bg-surface px-4 py-3 text-sm text-muted sm:col-span-2"
                  >
                    ¡Listo! Te abrimos WhatsApp con el pedido de turno. Si no se abrió,
                    llamanos al{' '}
                    <a href={`tel:${business.phoneHref}`} className="text-brass">
                      {business.phone}
                    </a>
                    .
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </Reveal>
        </div>

        <Reveal delay={0.15} as="aside" className="lg:col-span-5 lg:pt-24">
          <div className="border border-line bg-surface p-8">
            <h3 className="eyebrow">Horario</h3>
            <ul className="mt-6">
              {schedule.map((row) => {
                const isToday = row.day === todayName
                const isClosed = row.hours === 'Cerrado'
                return (
                  <li
                    key={row.day}
                    className={`flex items-center justify-between border-b border-line-soft py-2.5 text-sm last:border-b-0 ${
                      isToday ? 'text-bone' : 'text-muted'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isToday && <span className="h-1 w-1 rotate-45 bg-brass" />}
                      {row.day}
                    </span>
                    <span className={isClosed ? 'text-muted/60' : 'tabular-nums'}>
                      {row.hours}
                    </span>
                  </li>
                )
              })}
            </ul>

            <h3 className="eyebrow mt-10">Dónde estamos</h3>
            <p className="mt-4 text-sm text-muted">{business.address}</p>
            <a
              href={business.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block border-b border-brass-dim py-2 font-sans text-xs uppercase tracking-[0.14em] text-brass transition-colors hover:border-brass"
            >
              Ver en Google Maps
            </a>

            <h3 className="eyebrow mt-10">Contacto directo</h3>
            {/* py-2 en los enlaces: en móvil son el objetivo táctil principal
                de esta columna y con solo la altura de línea se quedan en 20px. */}
            <p className="mt-2 flex flex-col text-sm">
              <a
                href={`tel:${business.phoneHref}`}
                className="w-fit py-2 text-bone transition-colors hover:text-brass"
              >
                {business.phone}
              </a>
              <a
                href={`mailto:${business.email}`}
                className="w-fit py-2 text-muted transition-colors hover:text-brass"
              >
                {business.email}
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

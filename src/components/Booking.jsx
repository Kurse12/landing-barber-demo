import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { business, formatPrice, schedule, services, team } from '../data/site'
import { useReducedMotionPolicy } from '../hooks/useMotionPolicy'
import { showDemoToast } from '../lib/demoToast'
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

const EASE = [0.23, 1, 0.32, 1]

/*
  Un campo sí necesita borde: es la única forma de que se lea como algo donde
  se escribe. Va en el gris mínimo del sistema, no en tiza plena, para que la
  cuadrícula de seis campos no vuelva a meter doce líneas fuertes en pantalla.
*/
const fieldBase =
  'w-full border-2 bg-void px-4 py-3.5 font-sans text-sm text-chalk ' +
  'transition-colors duration-150 placeholder:text-chalk-2 focus:outline-none'

function validate(form, minDate) {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Poné tu nombre para saber a quién esperamos.'
  // Sin validar el formato exacto: los teléfonos argentinos se escriben de
  // cinco maneras distintas y rechazar una válida cuesta más que aceptar una rara.
  if (form.phone.replace(/\D/g, '').length < 8) errors.phone = 'Necesitamos un teléfono de contacto.'
  if (!form.date) errors.date = 'Elegí un día.'
  else if (form.date < minDate) errors.date = 'Ese día ya pasó.'
  if (!form.time) errors.time = 'Elegí una hora.'
  return errors
}

function Field({ id, label, error, className = '', children }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {/*
        Sin color de alerta, el error se marca por inversión: el mensaje va en
        una plancha de tiza con el tipo calado. Es la misma señal que usa la
        acción principal, y por eso se reconoce sin necesidad de rojo.
      */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="overflow-hidden"
          >
            <span className="mt-1 inline-block bg-chalk px-2 py-1 font-mono text-xs text-void">
              {error}
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Booking() {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent

  const reduced = useReducedMotionPolicy()
  const today = new Date()
  const todayName = DAYS[today.getDay()]
  const minDate = today.toISOString().slice(0, 10)

  const update = (field) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [field]: value }))
    // Validación en línea: el error se va en cuanto el usuario lo corrige, sin
    // esperar a que reenvíe. Solo se limpia, nunca se añade mientras escribe.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  // Demo: no hay backend ni WhatsApp real detrás de este formulario. En un
  // sitio real, esto abriría WhatsApp con el pedido ya redactado.
  const handleSubmit = (event) => {
    event.preventDefault()
    const found = validate(form, minDate)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }

    setStatus('sending')
    setForm(emptyForm)
    setStatus('sent')
  }

  // El campo con error sube a tiza plena: contra el gris de los demás, la fila
  // rota salta a la vista sin necesidad de un color dedicado.
  const fieldClass = (field) =>
    `${fieldBase} ${errors[field] ? 'border-chalk' : 'border-chalk-3 focus:border-chalk'}`

  return (
    <section id="reserva" className="bg-void">
      <div className="shell pb-16 pt-24 md:pt-32">
        <SectionHeading
          title="Sacá tu turno"
          meta="Confirmamos por WhatsApp"
          subtitle="Completá los datos y te escribimos en un rato para confirmarte."
          className="max-w-4xl"
        />
      </div>

      <div className="shell grid gap-20 pb-24 md:pb-32 lg:grid-cols-[1.5fr_1fr] lg:gap-24">
        <Reveal>
          <form onSubmit={handleSubmit} noValidate className="grid gap-7 sm:grid-cols-2">
            <Field id="name" label="Nombre" error={errors.name}>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Cómo te llamás"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className={fieldClass('name')}
                value={form.name}
                onChange={update('name')}
              />
            </Field>

            <Field id="phone" label="Teléfono" error={errors.phone}>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="11 2222 3333"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                className={fieldClass('phone')}
                value={form.phone}
                onChange={update('phone')}
              />
            </Field>

            <Field id="service" label="Servicio">
              <select
                id="service"
                className={fieldClass('service')}
                value={form.service}
                onChange={update('service')}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({formatPrice(service.price)})
                  </option>
                ))}
              </select>
            </Field>

            <Field id="barber" label="Barbero">
              <select
                id="barber"
                className={fieldClass('barber')}
                value={form.barber}
                onChange={update('barber')}
              >
                <option value="cualquiera">El que esté libre</option>
                {team.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="date" label="Día" error={errors.date}>
              <input
                id="date"
                type="date"
                min={minDate}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? 'date-error' : undefined}
                className={`${fieldClass('date')} [color-scheme:dark]`}
                value={form.date}
                onChange={update('date')}
              />
            </Field>

            <Field id="time" label="Hora" error={errors.time}>
              <input
                id="time"
                type="time"
                aria-invalid={Boolean(errors.time)}
                aria-describedby={errors.time ? 'time-error' : undefined}
                className={`${fieldClass('time')} [color-scheme:dark]`}
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
                placeholder="Alergias, referencia de corte, si venís con un chico"
                className={`${fieldClass('notes')} resize-none`}
                value={form.notes}
                onChange={update('notes')}
              />
            </Field>

            <div className="sm:col-span-2">
              <Button type="submit" disabled={status === 'sending'}>
                {/*
                  El desenfoque tapa el cruce entre las dos etiquetas: sin él
                  se ven dos textos superpuestos durante el cambio, y eso se
                  lee como un fallo de render.
                */}
                <motion.span
                  key={status}
                  initial={reduced ? false : { opacity: 0, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="block"
                >
                  {status === 'sending' ? 'Enviando' : 'Enviar solicitud'}
                </motion.span>
              </Button>
            </div>

            <AnimatePresence>
              {status === 'sent' && (
                <motion.p
                  role="status"
                  initial={{ opacity: 0, transform: 'translateY(-8px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="bg-chalk px-5 py-4 text-sm leading-relaxed text-void sm:col-span-2"
                >
                  Recibimos tu pedido de turno. Es una demo, así que no se envía a
                  ningún lado de verdad: en un sitio real esto abriría WhatsApp con
                  los datos que completaste.
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </Reveal>

        {/* Columna de datos: listas sueltas, sin tarjeta ni hairlines por fila.
            Las horas van en mono tabular, que es lo que las alinea. */}
        <Reveal as="aside" delay={0.1}>
          <h3 className="label">Horario</h3>
          <ul className="mt-6 flex flex-col gap-3">
            {schedule.map((row) => {
              const isToday = row.day === todayName
              const isClosed = row.hours === 'Cerrado'
              return (
                <li
                  key={row.day}
                  className={`flex items-baseline justify-between gap-6 font-mono text-sm ${
                    isToday ? 'text-chalk' : 'text-chalk-2'
                  }`}
                >
                  {/* El marcador solo aparece hoy: es estado real, no
                      decoración repetida en cada fila. */}
                  <span className="flex items-baseline gap-2">
                    {isToday && <span className="h-1.5 w-1.5 shrink-0 bg-chalk" />}
                    {row.day}
                  </span>
                  <span className={isClosed ? 'text-chalk-3' : 'tabular-nums'}>
                    {row.hours}
                  </span>
                </li>
              )
            })}
          </ul>

          <h3 className="label mt-12">Dónde estamos</h3>
          <p className="mt-4 text-sm text-chalk-2">{business.address}</p>
          <a
            href={business.mapsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => {
              event.preventDefault()
              showDemoToast('Esto es una demo: en un sitio real este enlace llevaría al mapa del negocio.')
            }}
            className="mt-3 inline-block border-b-2 border-chalk py-1 font-mono text-xs uppercase tracking-[0.14em] text-chalk transition-opacity duration-150 hover:opacity-60"
          >
            Ver en Google Maps
          </a>

          <h3 className="label mt-12">Contacto directo</h3>
          {/* py-2 en los enlaces: en móvil son el objetivo táctil principal de
              esta columna y con solo la altura de línea se quedan en 20px. */}
          <p className="mt-2 flex flex-col font-mono text-sm">
            <a
              href={`tel:${business.phoneHref}`}
              className="w-fit py-2 text-chalk transition-opacity duration-150 hover:opacity-60"
            >
              {business.phone}
            </a>
            <a
              href={`mailto:${business.email}`}
              className="w-fit py-2 text-chalk-2 transition-colors duration-150 hover:text-chalk"
            >
              {business.email}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  )
}

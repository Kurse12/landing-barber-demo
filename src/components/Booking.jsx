import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { business, formatPrice, schedule, services, stats, team } from '../data/site'
import { useReducedMotionPolicy } from '../hooks/useMotionPolicy'
import { submitBooking } from '../lib/booking'
import { showDemoToast } from '../lib/demoToast'
import { scrollToId } from '../lib/scroll'
import Button from './ui/Button'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
// La semana arranca en lunes, como se imprime un almanaque acá.
const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const STEPS = ['Servicio', 'Barbero', 'Día y hora', 'Confirmar']
const NEXT_LABELS = ['Barbero', 'Día y hora', 'Confirmar']

const ANY_BARBER = 'cualquiera'
const SLOT_STEP = 30 // minutos entre un horario y el siguiente
const MONTHS_AHEAD = 2 // hasta cuántos meses adelante se puede reservar
const NAV_OFFSET = 96 // alto de la barra fija más un respiro

// Franjas para no servir veinte horarios en una sola tira: quien viene antes
// del trabajo busca la mañana y no tiene por qué leer la tarde.
const PERIODS = [
  { id: 'manana', label: 'Mañana', test: (min) => min < 13 * 60 },
  { id: 'tarde', label: 'Tarde', test: (min) => min >= 13 * 60 && min < 18 * 60 },
  { id: 'noche', label: 'Desde las 18', test: (min) => min >= 18 * 60 },
]

const DAY_STATUS_LABEL = { past: 'Pasado', closed: 'Cerrado', full: 'Sin lugar' }

// "Lunes y domingo", o "lunes, martes y domingo" si algún día se suma a la
// lista de cierres. Se calcula una sola vez desde el mismo dato que pinta la
// columna "Horario": no hay dos fuentes de verdad sobre qué día se cierra.
function formatClosedDays(days) {
  if (days.length === 0) return ''
  if (days.length === 1) return days[0]
  return `${days.slice(0, -1).join(', ')} y ${days[days.length - 1]}`
}

const CLOSED_DAYS_LABEL = formatClosedDays(
  schedule.filter((row) => row.hours === 'Cerrado').map((row) => row.day.toLowerCase())
)

// Mismas cifras que ya generaron confianza en "La casa", resurgidas acá:
// quien llega hasta el botón de confirmar es quien más las necesita.
const YEARS_STAT = stats.find((stat) => stat.id === 's2')
const RATING_STAT = stats.find((stat) => stat.id === 's3')
const formatStat = (value, decimals) =>
  value.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

const emptyDraft = {
  service: null,
  barber: null,
  date: '',
  time: '',
  name: '',
  email: '',
  phone: '',
  notes: '',
}

const EASE = [0.23, 1, 0.32, 1]

const pad = (n) => String(n).padStart(2, '0')

// Fecha local, no toISOString(): esa conversión pasa por UTC, y en Buenos
// Aires (UTC-3) después de las 21:00 ya cae en el día siguiente.
const toDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
const toHHMM = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`

// Medianoche local: new Date('YYYY-MM-DD') sin hora se lee en UTC y el día
// de la semana puede quedar corrido uno.
const parseDateKey = (key) => new Date(`${key}T00:00:00`)
const formatLongDate = (key) =>
  parseDateKey(key).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

const findService = (id) => services.find((service) => service.id === id)
const findMember = (id) => team.find((member) => member.id === id)

function openingHours(dateKey) {
  const dayName = DAYS[parseDateKey(dateKey).getDay()]
  const row = schedule.find((item) => item.day === dayName)
  if (!row || row.hours === 'Cerrado') return null
  const [open, close] = row.hours.split(' - ')
  return { open: toMinutes(open), close: toMinutes(close) }
}

/*
  Demo: no hay agenda real detrás. La ocupación sale de un hash de barbero,
  día y bloque, así que es estable (el mismo hueco está ocupado cada vez que
  se mira) y distinta por barbero, que es lo que hace creíble elegir con quién.
*/
function hash(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const isBlockTaken = (barberId, dateKey, start) => hash(`${barberId}|${dateKey}|${start}`) % 100 < 35

// Un servicio largo ocupa varios bloques seguidos: el Ritual necesita tres
// bloques libres, no uno. Por eso los servicios largos tienen menos horarios.
function isBarberFree(barberId, dateKey, start, duration) {
  for (let t = start; t < start + duration; t += SLOT_STEP) {
    if (isBlockTaken(barberId, dateKey, t)) return false
  }
  return true
}

function candidatesFor(serviceId, barberId) {
  if (barberId === ANY_BARBER) {
    return team.filter((member) => member.services.includes(serviceId)).map((member) => member.id)
  }
  return [barberId]
}

function slotsFor({ date, service, barber }, now) {
  if (!date || !service || !barber) return []
  const hours = openingHours(date)
  if (!hours) return []

  const { duration } = findService(service)
  const candidates = candidatesFor(service, barber)
  const isToday = date === toDateKey(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const slots = []
  for (let start = hours.open; start + duration <= hours.close; start += SLOT_STEP) {
    if (isToday && start <= nowMinutes) continue
    if (candidates.some((id) => isBarberFree(id, date, start, duration))) slots.push(toHHMM(start))
  }
  return slots
}

function dayStatus(draft, dateKey, now) {
  if (dateKey < toDateKey(now)) return 'past'
  if (!openingHours(dateKey)) return 'closed'
  if (slotsFor({ ...draft, date: dateKey }, now).length === 0) return 'full'
  return 'open'
}

// Con "el que esté libre", el resumen nombra a quién le toca de verdad.
function assignedMember(draft) {
  if (draft.barber !== ANY_BARBER) return findMember(draft.barber)
  const { duration } = findService(draft.service)
  const start = toMinutes(draft.time)
  return team.find(
    (member) =>
      member.services.includes(draft.service) && isBarberFree(member.id, draft.date, start, duration)
  )
}

/*
  Cambiar una elección de atrás no puede dejar un turno imposible adelante:
  si el barbero no hace el servicio nuevo, se suelta; si la hora ya no está
  libre con esa combinación, se suelta la hora; si el día se quedó sin lugar,
  se suelta el día. Lo que sigue valiendo se conserva.
*/
function reconcile(draft, now) {
  let next = draft
  const member = findMember(next.barber)
  if (member && next.service && !member.services.includes(next.service)) {
    next = { ...next, barber: null }
  }
  if (next.date && dayStatus(next, next.date, now) !== 'open' && next.barber) {
    next = { ...next, date: '', time: '' }
  }
  if (next.time && !slotsFor(next, now).includes(next.time)) {
    next = { ...next, time: '' }
  }
  return next
}

function monthCells(year, month) {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7
  const total = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: lead }, () => null)
  for (let day = 1; day <= total; day += 1) {
    cells.push(`${year}-${pad(month + 1)}-${pad(day)}`)
  }
  return cells
}

function validate(draft) {
  const errors = {}
  if (draft.name.trim().length < 2) errors.name = 'Poné tu nombre para saber a quién esperamos.'
  // Chequeo de forma, no de existencia: que tenga algo, arroba, dominio y
  // punto. Si el mail no existe, eso lo dice la API al mandar la confirmación.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
    errors.email = draft.email.trim()
      ? 'Ese mail no parece completo, revisalo.'
      : 'Dejanos tu mail: ahí te llega la confirmación.'
  }
  // Sin validar el formato exacto: los teléfonos argentinos se escriben de
  // cinco maneras distintas y rechazar una válida cuesta más que aceptar una rara.
  if (draft.phone.replace(/\D/g, '').length < 8) errors.phone = 'Dejanos un teléfono de contacto.'
  return errors
}

/*
  Tarjeta de elección. Un campo sí necesita borde, y una opción también: es lo
  que la hace leer como algo que se toca. En chalk 3 en reposo; la elegida se
  invierte, que es la única marca de énfasis del sistema.
*/
const choiceBase =
  'border-2 text-left transition-[background-color,color,border-color,transform] duration-150 ' +
  'ease-out-strong active:translate-y-[2px]'
const choiceOff = 'border-chalk-3 bg-transparent text-chalk can-hover:hover:border-chalk'
const choiceOn = 'border-chalk bg-chalk text-void'
const choiceDisabled = 'cursor-not-allowed border-transparent text-chalk-3 active:translate-y-0'

const fieldBase =
  'w-full border-2 bg-void px-4 py-3.5 font-sans text-sm text-chalk ' +
  'transition-colors duration-150 placeholder:text-chalk-2 focus:outline-none'

// Sin color de alerta: el aviso se marca por inversión, igual que los errores.
function Notice({ id, children }) {
  return (
    <span id={id} className="inline-block bg-chalk px-2 py-1 font-mono text-xs text-void">
      {children}
    </span>
  )
}

function Field({ id, label, required = false, error, className = '', children }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="label">
        {label}
        {/* Asterisco visible + `required` nativo en el input: el primero avisa
            a golpe de vista, el segundo lo anuncia a un lector de pantalla. */}
        {required && (
          <span aria-hidden="true" className="text-chalk">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {/* Solo opacity, nunca height: el sistema no anima layout (DESIGN.md s7). */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="mt-1"
          >
            <Notice id={`${id}-error`}>{error}</Notice>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Booking({ selectedService }) {
  const reduced = useReducedMotionPolicy()
  const now = new Date()
  const todayKey = toDateKey(now)
  const todayName = DAYS[now.getDay()]

  const [draft, setDraft] = useState(emptyDraft)
  const [step, setStep] = useState(0)
  const [view, setView] = useState(() => ({ year: now.getFullYear(), month: now.getMonth() }))
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent
  // Quiso avanzar sin elegir: el aviso de qué falta sube a plancha invertida.
  const [blocked, setBlocked] = useState(false)
  // La hora elegida se ocupó (o pasó) mientras completaba sus datos.
  const [slotLost, setSlotLost] = useState(false)
  // La API rechazó el pedido: se avisa y se deja reintentar con todo cargado.
  const [submitError, setSubmitError] = useState('')

  const direction = useRef(1)
  const pendingFocus = useRef(false)
  const headingRef = useRef(null)
  const wizardRef = useRef(null)

  // Quien elige un servicio en La carta no debería tener que volver a
  // buscarlo acá: llega con el servicio puesto y directo a elegir barbero.
  useEffect(() => {
    if (!selectedService) return
    setDraft((prev) => reconcile({ ...prev, service: selectedService.id }, new Date()))
    setStatus('idle')
    setBlocked(false)
    direction.current = 1
    setStep(1)
  }, [selectedService])

  // Al cambiar de paso el foco va al título del paso nuevo: un lector de
  // pantalla anuncia dónde quedó, y el tabulador sigue desde ahí y no desde
  // un botón que ya no existe. En la primera carga no se mueve nada.
  useEffect(() => {
    if (!pendingFocus.current) return
    pendingFocus.current = false
    headingRef.current?.focus({ preventScroll: true })
    // Cada paso está pensado para verse entero en una pantalla. Si el paso
    // nuevo quedó tapado por la barra o se sale por abajo, se lo alinea
    // arriba; si ya se ve completo, no se mueve nada.
    const rect = wizardRef.current?.getBoundingClientRect()
    if (rect && (rect.top < NAV_OFFSET - 8 || rect.bottom > window.innerHeight)) {
      scrollToId('turno-asistente', { offset: -NAV_OFFSET })
    }
  }, [step, status])

  const service = findService(draft.service)
  const slots = slotsFor(draft, now)
  const ready = [Boolean(draft.service), Boolean(draft.barber), Boolean(draft.date && draft.time), true]
  const maxReachable = ready.findIndex((isReady) => !isReady)

  const goTo = (index) => {
    direction.current = index > step ? 1 : -1
    pendingFocus.current = true
    setBlocked(false)
    setStep(index)
  }

  const choose = (patch) => {
    setDraft((prev) => reconcile({ ...prev, ...patch }, new Date()))
    setBlocked(false)
    setSlotLost(false)
  }

  const update = (field) => (event) => {
    const { value } = event.target
    setDraft((prev) => ({ ...prev, [field]: value }))
    // Validación en línea: el error se va en cuanto el usuario lo corrige.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const next = () => {
    if (!ready[step]) {
      setBlocked(true)
      return
    }
    goTo(step + 1)
  }

  const shiftMonth = (delta) => {
    setView(({ year, month }) => {
      const date = new Date(year, month + delta, 1)
      return { year: date.getFullYear(), month: date.getMonth() }
    })
  }

  // El envío real vive en lib/booking.js: hoy simula, mañana llama a la API
  // que manda la confirmación por mail.
  const handleSubmit = async (event) => {
    event.preventDefault()
    if (step < 3) {
      next()
      return
    }

    if (!slotsFor(draft, new Date()).includes(draft.time)) {
      setDraft((prev) => ({ ...prev, time: '' }))
      setSlotLost(true)
      goTo(2)
      return
    }

    const found = validate(draft)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }

    setStatus('sending')
    setSubmitError('')
    const member = assignedMember(draft)
    try {
      await submitBooking({
        service: draft.service,
        barber: member?.id ?? null,
        anyBarber: draft.barber === ANY_BARBER,
        date: draft.date,
        time: draft.time,
        duration: service.duration,
        price: service.price,
        name: draft.name.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        notes: draft.notes.trim(),
      })
      pendingFocus.current = true
      setStatus('sent')
    } catch {
      setStatus('idle')
      setSubmitError('No pudimos reservar el turno. Probá de nuevo en un momento.')
    }
  }

  const startOver = () => {
    setDraft(emptyDraft)
    setErrors({})
    setSlotLost(false)
    setStatus('idle')
    direction.current = -1
    pendingFocus.current = true
    setStep(0)
  }

  const fieldClass = (field) =>
    `${fieldBase} ${errors[field] ? 'border-chalk' : 'border-chalk-3 focus:border-chalk'}`

  const viewIndex = view.year * 12 + view.month
  const todayIndex = now.getFullYear() * 12 + now.getMonth()
  const hints = [
    'Elegí un servicio para seguir.',
    'Elegí con quién para seguir.',
    draft.date ? 'Elegí una hora para seguir.' : 'Elegí un día para seguir.',
  ]

  const stepTitle = (text, context) => (
    <div className="mb-6">
      <h3
        ref={headingRef}
        id="turno-paso-titulo"
        tabIndex={-1}
        className="text-2xl leading-none tracking-[-0.02em] text-chalk focus:outline-none md:text-3xl"
      >
        {text}
      </h3>
      {context && <p className="label mt-3">{context}</p>}
    </div>
  )

  const renderService = () => (
    <>
      {stepTitle('Qué te hacés')}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-labelledby="turno-paso-titulo">
        {services.map((item, i) => {
          const selected = draft.service === item.id
          const muted = selected ? 'text-void/70' : 'text-chalk-2'
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => choose({ service: item.id })}
                className={`${choiceBase} flex h-full w-full flex-col gap-5 p-5 ${selected ? choiceOn : choiceOff}`}
              >
                <span className="flex items-baseline justify-between gap-4">
                  <span className={`font-mono text-xs tabular-nums ${muted}`}>{pad(i + 1)}</span>
                  {item.featured && (
                    <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em]">
                      Más pedido
                    </span>
                  )}
                </span>
                <span className="font-display text-xl uppercase leading-none">{item.name}</span>
                <span className="mt-auto flex items-baseline justify-between gap-4 font-mono text-xs tabular-nums">
                  <span className={muted}>{item.duration} min</span>
                  <span>{formatPrice(item.price)}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )

  const renderBarber = () => {
    const options = [
      { id: ANY_BARBER, name: 'El que esté libre', role: 'Más horarios para elegir' },
      ...team,
    ]
    return (
      <>
        {stepTitle('Con quién', `${service.name} · ${service.duration} min`)}
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-labelledby="turno-paso-titulo">
          {options.map((member) => {
            const selected = draft.barber === member.id
            const available =
              member.id === ANY_BARBER
                ? team.some((m) => m.services.includes(draft.service))
                : member.services.includes(draft.service)
            const state = selected ? choiceOn : available ? choiceOff : choiceDisabled
            return (
              <li key={member.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  disabled={!available}
                  onClick={() => choose({ barber: member.id })}
                  className={`${choiceBase} flex w-full items-center gap-4 p-3 ${state}`}
                >
                  <span
                    className={`relative h-16 w-16 shrink-0 overflow-hidden bg-void-2 ${available ? '' : 'opacity-40'}`}
                  >
                    {member.photo ? (
                      <picture>
                        <source srcSet={member.photoWebp} type="image/webp" />
                        <img
                          src={member.photo}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover grayscale contrast-125"
                        />
                      </picture>
                    ) : (
                      <span aria-hidden="true" className="placeholder-art block h-full w-full" />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col gap-2">
                    <span className="font-display text-lg uppercase leading-none">{member.name}</span>
                    <span
                      className={`font-mono text-[0.68rem] uppercase tracking-[0.14em] ${
                        selected ? 'text-void/70' : available ? 'text-chalk-2' : ''
                      }`}
                    >
                      {available ? member.role : 'No hace este servicio'}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </>
    )
  }

  const renderWhen = () => {
    const barberName =
      draft.barber === ANY_BARBER ? 'El que esté libre' : findMember(draft.barber)?.name
    return (
      <>
        {stepTitle('Cuándo', `${service.name} · ${barberName}`)}

        {slotLost && (
          <p role="alert" className="mb-8">
            <Notice>Esa hora se ocupó mientras completabas los datos. Elegí otra.</Notice>
          </p>
        )}

        {/* Calendario y horarios lado a lado desde 1024px. Apilados, elegir un
            día empujaba los horarios y el botón para seguir fuera de pantalla:
            el paso entero tiene que caber en un solo vistazo. */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="font-display text-xl uppercase leading-none" aria-live="polite">
                {MONTHS[view.month]} {view.year}
              </p>
              <div className="flex gap-2">
                {[
                  { delta: -1, label: 'Mes anterior', glyph: '←', disabled: viewIndex <= todayIndex },
                  { delta: 1, label: 'Mes siguiente', glyph: '→', disabled: viewIndex >= todayIndex + MONTHS_AHEAD },
                ].map((nav) => (
                  <button
                    key={nav.delta}
                    type="button"
                    aria-label={nav.label}
                    disabled={nav.disabled}
                    onClick={() => shiftMonth(nav.delta)}
                    className={`${choiceBase} flex h-11 w-11 items-center justify-center font-mono text-sm ${
                      nav.disabled ? choiceDisabled : choiceOff
                    }`}
                  >
                    <span aria-hidden="true">{nav.glyph}</span>
                  </button>
                ))}
              </div>
            </div>

            {CLOSED_DAYS_LABEL && <p className="label mt-1">Cerramos {CLOSED_DAYS_LABEL}</p>}

            <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-1.5">
              {WEEKDAYS_SHORT.map((day) => (
                <span key={day} aria-hidden="true" className="label pb-1 text-center">
                  {day}
                </span>
              ))}
              {monthCells(view.year, view.month).map((key, i) => {
                if (!key) return <span key={`vacío-${i}`} aria-hidden="true" />
                const statusKey = dayStatus(draft, key, now)
                const disabled = statusKey !== 'open'
                const selected = draft.date === key
                const state = selected ? choiceOn : disabled ? choiceDisabled : choiceOff
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    aria-pressed={selected}
                    aria-label={`${formatLongDate(key)}${disabled ? `, ${DAY_STATUS_LABEL[statusKey].toLowerCase()}` : ''}`}
                    onClick={() => {
                      if (!selected) choose({ date: key, time: '' })
                    }}
                    className={`${choiceBase} relative flex h-12 flex-col items-center justify-center gap-0.5 text-center font-mono tabular-nums sm:h-14 short:h-11 ${state}`}
                  >
                    <span className="text-sm">{Number(key.slice(8))}</span>
                    {/* En un teléfono no entra la palabra: el día apagado y el
                        aria-label ya dicen que no se puede. */}
                    {disabled && (
                      <span className="hidden text-[0.55rem] uppercase tracking-[0.1em] sm:block">
                        {DAY_STATUS_LABEL[statusKey]}
                      </span>
                    )}
                    {/* El marcador de hoy es estado real, igual que en "Horario". */}
                    {key === todayKey && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-1.5 top-1.5 h-1.5 w-1.5 ${selected ? 'bg-void' : disabled ? 'bg-chalk-3' : 'bg-chalk'}`}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            {draft.date ? (
              <>
                <p className="label text-chalk">Horarios del {formatLongDate(draft.date)}</p>
                {PERIODS.map((period) => {
                  const list = slots.filter((time) => period.test(toMinutes(time)))
                  if (list.length === 0) return null
                  return (
                    <div key={period.id} className="mt-5">
                      <p className="label" id={`franja-${period.id}`}>
                        {period.label}
                      </p>
                      <div
                        className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2"
                        role="group"
                        aria-labelledby={`franja-${period.id}`}
                      >
                        {list.map((time) => {
                          const selected = draft.time === time
                          return (
                            <button
                              key={time}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => choose({ time })}
                              className={`${choiceBase} px-2 py-3 text-center font-mono text-sm tabular-nums ${
                                selected ? choiceOn : choiceOff
                              }`}
                            >
                              {time}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </>
            ) : (
              <p className="text-sm text-chalk-2 lg:mt-12">Elegí un día y te mostramos los horarios libres.</p>
            )}
          </div>
        </div>
      </>
    )
  }

  const renderConfirm = () => {
    const member = assignedMember(draft)
    const summary = [
      ['Servicio', service.name],
      ['Barbero', draft.barber === ANY_BARBER ? `${member?.name} (el que estaba libre)` : member?.name],
      ['Día', formatLongDate(draft.date)],
      ['Hora', draft.time],
      ['Duración', `${service.duration} min`],
      ['Precio', formatPrice(service.price)],
    ]
    return (
      <>
        {stepTitle('Revisá y confirmá')}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 xl:grid-cols-6">
          {summary.map(([label, value]) => (
            <div key={label}>
              <dt className="label">{label}</dt>
              <dd className="mt-2 font-mono text-sm text-chalk first-letter:uppercase">{value}</dd>
            </div>
          ))}
        </dl>

        <fieldset className="m-0 mt-10 min-w-0 border-0 p-0">
          <legend className="label block w-full p-0 text-chalk">Tus datos</legend>
          <p className="mb-7 mt-2 text-sm text-chalk-2">
            La confirmación te llega por mail. El teléfono es por si hay que avisarte algo.
          </p>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            <Field id="name" label="Nombre" required error={errors.name}>
              <input
                id="name"
                type="text"
                autoComplete="name"
                maxLength={80}
                required
                placeholder="Cómo te llamás"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className={fieldClass('name')}
                value={draft.name}
                onChange={update('name')}
              />
            </Field>

            <Field id="email" label="Mail" required error={errors.email}>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={120}
                required
                placeholder="nombre@correo.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={fieldClass('email')}
                value={draft.email}
                onChange={update('email')}
              />
            </Field>

            <Field id="phone" label="Teléfono" required error={errors.phone}>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                maxLength={20}
                required
                placeholder="11 2222 3333"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                className={fieldClass('phone')}
                value={draft.phone}
                onChange={update('phone')}
              />
            </Field>

            <Field id="notes" label="Algo que debamos saber (opcional)" className="sm:col-span-2 lg:col-span-3">
              <textarea
                id="notes"
                rows="3"
                maxLength={400}
                placeholder="Alergias, referencia de corte, si venís con un chico"
                className={`${fieldClass('notes')} resize-none`}
                value={draft.notes}
                onChange={update('notes')}
              />
            </Field>
          </div>
        </fieldset>
      </>
    )
  }

  const renderSent = () => {
    const member = assignedMember(draft)
    return (
      <>
        {stepTitle('Turno pedido')}
        <div role="status" className="bg-chalk px-5 py-5 text-void">
          <p className="font-mono text-sm leading-relaxed">
            {service.name} con {member?.name}, {formatLongDate(draft.date)} a las {draft.time}.
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            Te mandamos la confirmación a <span className="font-mono">{draft.email.trim()}</span>. Si
            no la ves en unos minutos, revisá la carpeta de spam.
          </p>
        </div>
        <Button type="button" variant="ghost" className="mt-8" onClick={startOver}>
          Sacar otro turno
        </Button>
      </>
    )
  }

  const renderers = [renderService, renderBarber, renderWhen, renderConfirm]
  const sent = status === 'sent'

  return (
    <section id="reserva" className="bg-void">
      <div className="shell pb-16 pt-24 md:pt-32">
        <SectionHeading
          title="Sacá tu turno"
          meta="Confirmación por mail"
          subtitle="Servicio, barbero, día y hora. Elegís sobre los horarios libres y te llega la confirmación por mail."
          className="max-w-4xl"
        />
      </div>

      <div className="shell pb-24 md:pb-32">
        <Reveal>
          {/* El aviso de demo llega antes de que alguien escriba su nombre y
              teléfono, no después de enviarlos. */}
          <p className="label">Turnero de demostración, no se envía a ningún lado real</p>

          <form
            id="turno-asistente"
            ref={wizardRef}
            onSubmit={handleSubmit}
            noValidate
            className="mt-8"
            aria-labelledby="turno-paso-titulo"
          >
            {/* Progreso: cada tramo es un control (vuelve a un paso ya hecho),
                no una regla de retícula. Hecho y actual en tiza, pendiente en
                chalk 3. */}
            <ol className="grid grid-cols-4 gap-2">
              {STEPS.map((label, i) => {
                const current = !sent && i === step
                const done = sent || i < step
                const reachable = !sent && i <= maxReachable && i !== step
                return (
                  <li key={label}>
                    <button
                      type="button"
                      disabled={!reachable}
                      aria-current={current ? 'step' : undefined}
                      onClick={() => goTo(i)}
                      className="group flex w-full flex-col gap-3 pb-2 text-left disabled:cursor-default"
                    >
                      <span
                        aria-hidden="true"
                        className={`block h-[2px] w-full transition-colors duration-150 ${
                          current || done ? 'bg-chalk' : 'bg-chalk-3'
                        }`}
                      />
                      <span
                        className={`flex flex-col gap-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-colors duration-150 sm:flex-row sm:gap-2 ${
                          current
                            ? 'font-bold text-chalk'
                            : done || reachable
                              ? 'text-chalk-2 can-hover:group-enabled:group-hover:text-chalk'
                              : 'text-chalk-3'
                        }`}
                      >
                        <span className="tabular-nums">{pad(i + 1)}</span>
                        <span>{label}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>

            {/* Sin salida animada: el paso nuevo tiene que existir en el mismo
                render para recibir el foco. Entra con un fundido corto que se
                corre hacia el lado al que se avanzó. */}
            <motion.div
              key={sent ? 'sent' : step}
              initial={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, transform: `translateX(${direction.current * 12}px)` }
              }
              animate={{ opacity: 1, transform: 'translateX(0px)' }}
              transition={{ duration: 0.22, ease: EASE }}
              className="mt-10"
            >
              {sent ? renderSent() : renderers[step]()}
            </motion.div>

            {!sent && (
              <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => goTo(step - 1)}
                    className="py-3 font-mono text-xs uppercase tracking-[0.14em] text-chalk-2 transition-colors duration-150 can-hover:hover:text-chalk"
                  >
                    <span aria-hidden="true">← </span>
                    Volver
                  </button>
                ) : (
                  <span />
                )}

                <div className="ml-auto flex flex-col items-end gap-3 text-right">
                  <p aria-live="polite" className="min-h-6">
                    {step === 3 && submitError && <Notice>{submitError}</Notice>}
                    {step < 3 && !ready[step] && (
                      blocked ? (
                        <Notice id="turno-falta">{hints[step]}</Notice>
                      ) : (
                        <span id="turno-falta" className="font-mono text-xs text-chalk-2">
                          {hints[step]}
                        </span>
                      )
                    )}
                  </p>

                  {step < 3 ? (
                    <Button
                      type="button"
                      variant={ready[step] ? 'primary' : 'inert'}
                      aria-disabled={!ready[step]}
                      aria-describedby={ready[step] ? undefined : 'turno-falta'}
                      onClick={next}
                    >
                      {NEXT_LABELS[step]}
                      <span aria-hidden="true" className="ml-3">→</span>
                    </Button>
                  ) : (
                    <Button type="submit" disabled={status === 'sending'}>
                      {/* El desenfoque tapa el cruce entre las dos etiquetas:
                          sin él se ven dos textos superpuestos. */}
                      <motion.span
                        key={status}
                        initial={reduced ? false : { opacity: 0, filter: 'blur(3px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.18, ease: EASE }}
                        className="block"
                      >
                        {status === 'sending' ? 'Enviando' : 'Confirmar turno'}
                      </motion.span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Justo antes de confirmar es cuando un primerizo más se pregunta
                si vale la pena y qué pasa si algo cambia. */}
            {step === 3 && !sent && (
              <div className="mt-6 flex flex-col items-end text-right">
                {YEARS_STAT && RATING_STAT && (
                  <p className="font-mono text-xs tabular-nums text-chalk-2">
                    <span className="text-chalk">{formatStat(YEARS_STAT.to, YEARS_STAT.decimals)}</span>{' '}
                    {YEARS_STAT.label}
                    <span aria-hidden="true"> · </span>
                    <span className="text-chalk">{formatStat(RATING_STAT.to, RATING_STAT.decimals)}</span>{' '}
                    {RATING_STAT.label}
                  </p>
                )}
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-chalk-2">
                  Te llega la confirmación por mail. Si no podés venir, avisanos y reprogramamos sin
                  cargo.
                </p>
              </div>
            )}
          </form>
        </Reveal>

        {/* Datos del local debajo del asistente, no al costado: al costado le
            robaban un tercio del ancho y el paso de día y hora dejaba de caber
            en pantalla. Listas sueltas, sin tarjeta ni hairlines por fila. */}
        <Reveal as="aside" delay={0.1} className="mt-24 grid gap-14 md:grid-cols-3 md:gap-10">
          <div className="max-w-sm">
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
                    <span className={isClosed ? 'text-chalk-3' : 'tabular-nums'}>{row.hours}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <h3 className="label">Dónde estamos</h3>
            <p className="mt-6 text-sm text-chalk-2">{business.address}</p>
            {/* <button>, no <a href="#">: sin un href real no hay destino que el
                clic derecho o el clic del medio puedan seguir sin el aviso. */}
            <button
              type="button"
              onClick={() => {
                showDemoToast('Esto es una demo: en un sitio real este enlace llevaría al mapa del negocio.')
              }}
              className="mt-3 inline-block border-b-2 border-chalk py-1 font-mono text-xs uppercase tracking-[0.14em] text-chalk transition-opacity duration-150 can-hover:hover:opacity-60"
            >
              Ver en Google Maps
            </button>
          </div>

          <div>
            <h3 className="label">Contacto directo</h3>
            {/* py-2: en móvil son el objetivo táctil principal de esta columna. */}
            <p className="mt-4 flex flex-col font-mono text-sm">
              <button
                type="button"
                onClick={() => {
                  showDemoToast('Esto es una demo: en un sitio real este enlace abriría el teléfono para llamar.')
                }}
                className="w-fit py-2 text-left text-chalk transition-opacity duration-150 can-hover:hover:opacity-60"
              >
                {business.phone}
              </button>
              <button
                type="button"
                onClick={() => {
                  showDemoToast('Esto es una demo: en un sitio real este enlace abriría el correo para escribir.')
                }}
                className="w-fit py-2 text-left text-chalk-2 transition-colors duration-150 can-hover:hover:text-chalk"
              >
                {business.email}
              </button>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

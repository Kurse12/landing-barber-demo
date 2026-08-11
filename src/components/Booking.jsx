import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { business, formatPrice, schedule, services, stats, team } from '../data/site'
import { useReducedMotionPolicy } from '../hooks/useMotionPolicy'
import { showDemoToast } from '../lib/demoToast'
import Button from './ui/Button'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

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
// quien llega hasta el botón de enviar es quien más las necesita, y ahí
// arriba quedaron a varias pantallas de distancia. Mismo formato `es-AR`
// que usa esa sección, para no decir "22" de un lado y "22,0" del otro.
const YEARS_STAT = stats.find((stat) => stat.id === 's2')
const RATING_STAT = stats.find((stat) => stat.id === 's3')
const formatStat = (value, decimals) =>
  value.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

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

// El input date entrega "YYYY-MM-DD" en hora local. new Date(dateStr) sin hora
// lo interpreta en UTC, así que en Buenos Aires (UTC-3) el día de la semana
// puede leerse corrido un día. Fijar la hora a medianoche local lo evita.
function dayScheduleFor(dateStr) {
  const dayName = DAYS[new Date(`${dateStr}T00:00:00`).getDay()]
  return schedule.find((row) => row.day === dayName)
}

function validate(form, minDate, nowTime) {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Poné tu nombre para saber a quién esperamos.'
  // Sin validar el formato exacto: los teléfonos argentinos se escriben de
  // cinco maneras distintas y rechazar una válida cuesta más que aceptar una rara.
  if (form.phone.replace(/\D/g, '').length < 8) errors.phone = 'Dejanos un teléfono de contacto.'

  if (!form.date) {
    errors.date = 'Elegí un día.'
  } else if (form.date < minDate) {
    errors.date = 'Ese día ya pasó.'
  } else if (dayScheduleFor(form.date)?.hours === 'Cerrado') {
    errors.date = 'Ese día cerramos, elegí otro.'
  }

  if (!form.time) {
    errors.time = 'Elegí una hora.'
  } else if (!errors.date) {
    // Mismo día: una hora que ya pasó no es un turno posible aunque el
    // día siga siendo válido.
    if (form.date === minDate && form.time <= nowTime) {
      errors.time = 'Esa hora ya pasó, elegí otra.'
    } else {
      const day = dayScheduleFor(form.date)
      const [open, close] = day.hours.split(' - ')
      if (form.time < open || form.time > close) {
        errors.time = `Ese día atendemos de ${open} a ${close}.`
      }
    }
  }

  return errors
}

function Field({ id, label, required = false, error, className = '', children }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="label">
        {label}
        {/* Asterisco visible + `required` nativo en el input: el primero avisa
            a golpe de vista, el segundo lo anuncia a un lector de pantalla
            antes de que el usuario llegue a enviar el formulario. */}
        {required && (
          <span aria-hidden="true" className="text-chalk">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {/*
        Sin color de alerta, el error se marca por inversión: el mensaje va en
        una plancha de tiza con el tipo calado. Es la misma señal que usa la
        acción principal, y por eso se reconoce sin necesidad de rojo.
      */}
      {/*
        Solo opacity, nunca height: el sistema no anima layout (DESIGN.md
        s7). El mensaje reserva su lugar de una y aparece con un fundido
        rápido, coherente con que un cartel no tiene estados intermedios.
      */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE }}
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

export default function Booking({ selectedService }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent

  // Quien elige un servicio en La carta no debería tener que volver a
  // buscarlo acá: el clic en esa fila manda el id hasta este formulario.
  useEffect(() => {
    if (selectedService) {
      setForm((prev) => ({ ...prev, service: selectedService }))
    }
  }, [selectedService])

  const reduced = useReducedMotionPolicy()
  const today = new Date()
  const todayName = DAYS[today.getDay()]
  // Fecha y hora locales, no toISOString(): esa conversión pasa por UTC, y en
  // Buenos Aires (UTC-3) después de las 21:00 ya cae en el día siguiente,
  // así que bloquearía reservar para hoy en el propio horario nocturno.
  const pad = (n) => String(n).padStart(2, '0')
  const minDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  const nowTime = `${pad(today.getHours())}:${pad(today.getMinutes())}`

  const update = (field) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [field]: value }))
    // Validación en línea: el error se va en cuanto el usuario lo corrige, sin
    // esperar a que reenvíe. Solo se limpia, nunca se añade mientras escribe.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
    // Si ya había un turno confirmado, empezar a completar uno nuevo retira
    // ese aviso: si no, queda diciendo "recibimos tu pedido" bajo un formulario
    // que el usuario está llenando de nuevo, y eso mezcla el estado viejo con
    // el que está armando ahora.
    setStatus((prev) => (prev === 'sent' ? 'idle' : prev))
  }

  // Demo: no hay backend ni WhatsApp real detrás de este formulario. En un
  // sitio real, esto abriría WhatsApp con el pedido ya redactado.
  const handleSubmit = (event) => {
    event.preventDefault()
    const found = validate(form, minDate, nowTime)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }

    setStatus('sending')

    // Sin el retraso, React agrupa los tres cambios de estado del handler en
    // un solo render y salta directo a "sent": el usuario nunca ve "Enviando"
    // y el botón pasa de reposo a confirmado sin marcar que el pedido se
    // está procesando.
    window.setTimeout(() => {
      setForm(emptyForm)
      setStatus('sent')
    }, 900)
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
          {/* Mismo aviso que el resto de la página, pero acá llega antes de que
              alguien escriba su nombre y teléfono, no después de enviarlos:
              es el único punto donde el aviso corría detrás del dato en vez
              de delante. */}
          <p className="label">Formulario de demostración, no se envía a ningún lado real</p>
          <p className="label mt-2">Campos con * son obligatorios</p>
          {/* P1: antes vivía solo en la columna de horarios, que en móvil
              cae después de todo el formulario (grid a una columna bajo
              1024px). Quien completaba el día ahí no se enteraba de qué día
              cerramos hasta el error al enviar. Va acá, antes del campo, y
              además queda enlazado al input por aria-describedby más abajo. */}
          {CLOSED_DAYS_LABEL && (
            <p id="closed-days-hint" className="label mt-2">
              Cerramos {CLOSED_DAYS_LABEL}
            </p>
          )}
          {/*
            Dos grupos, no siete campos sueltos: "Vos" (quién sos) y "Turno"
            (qué querés y cuándo). El <fieldset> es la agrupación semántica
            correcta para un lector de pantalla; el <legend> reusa el mismo
            vocabulario mono de las etiquetas de la columna de al lado
            ("Horario", "Dónde estamos"), así que no suma lenguaje visual
            nuevo. `min-w-0` porque un <fieldset> trae un mínimo intrínseco
            propio del navegador que, sin esto, puede desbordar la grilla en
            pantallas angostas.
          */}
          <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-12">
            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="label mb-7 block w-full p-0">Vos</legend>
              <div className="grid gap-7 sm:grid-cols-2">
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
                    value={form.name}
                    onChange={update('name')}
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
                    value={form.phone}
                    onChange={update('phone')}
                  />
                </Field>
              </div>
            </fieldset>

            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="label mb-7 block w-full p-0">Turno</legend>

              {/* "Qué" y "Cuándo" son dos decisiones distintas, no cuatro
                  campos sueltos: primero el servicio y con quién, después el
                  día y la hora. Fieldsets anidados son HTML válido y un
                  lector de pantalla los anuncia encadenados ("Turno, Qué,
                  Servicio"), así que el agrupamiento no se pierde, se precisa. */}
              <div className="flex flex-col gap-10">
                <fieldset className="m-0 min-w-0 border-0 p-0">
                  <legend className="label mb-4 block w-full p-0">Qué</legend>
                  <div className="grid gap-7 sm:grid-cols-2">
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
                  </div>
                </fieldset>

                <fieldset className="m-0 min-w-0 border-0 p-0">
                  <legend className="label mb-4 block w-full p-0">Cuándo</legend>
                  <div className="grid gap-7 sm:grid-cols-2">
                    <Field id="date" label="Día" required error={errors.date}>
                      <input
                        id="date"
                        type="date"
                        min={minDate}
                        required
                        aria-invalid={Boolean(errors.date)}
                        aria-describedby={errors.date ? 'date-error closed-days-hint' : 'closed-days-hint'}
                        className={`${fieldClass('date')} [color-scheme:dark]`}
                        value={form.date}
                        onChange={update('date')}
                      />
                    </Field>

                    <Field id="time" label="Hora" required error={errors.time}>
                      <input
                        id="time"
                        type="time"
                        required
                        aria-invalid={Boolean(errors.time)}
                        aria-describedby={errors.time ? 'time-error' : undefined}
                        className={`${fieldClass('time')} [color-scheme:dark]`}
                        value={form.time}
                        onChange={update('time')}
                      />
                    </Field>
                  </div>
                </fieldset>
              </div>

              {/* Ni "qué" ni "cuándo": una nota libre no pertenece a
                  ninguna de las dos preguntas, así que queda fuera de ambos
                  subgrupos en vez de forzarla en uno. */}
              <div className="mt-10">
                <Field id="notes" label="Algo que debamos saber (opcional)">
                  <textarea
                    id="notes"
                    rows="3"
                    maxLength={400}
                    placeholder="Alergias, referencia de corte, si venís con un chico"
                    className={`${fieldClass('notes')} resize-none`}
                    value={form.notes}
                    onChange={update('notes')}
                  />
                </Field>
              </div>
            </fieldset>

            <div>
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

              {/* Justo antes de mandar sus datos es cuando un primerizo más
                  se pregunta si esto vale la pena y qué pasa si algo cambia.
                  Una cifra que ya probó su valor arriba y una respuesta a esa
                  segunda pregunta, las dos a mano en el mismo momento. */}
              {YEARS_STAT && RATING_STAT && (
                <p className="mt-5 font-mono text-xs tabular-nums text-chalk-2">
                  <span className="text-chalk">{formatStat(YEARS_STAT.to, YEARS_STAT.decimals)}</span>{' '}
                  {YEARS_STAT.label}
                  <span aria-hidden="true"> · </span>
                  <span className="text-chalk">{formatStat(RATING_STAT.to, RATING_STAT.decimals)}</span>{' '}
                  {RATING_STAT.label}
                </p>
              )}
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-chalk-2">
                Confirmamos por WhatsApp el mismo día. Si no podés venir, avisanos
                y reprogramamos sin cargo.
              </p>
            </div>

            <AnimatePresence>
              {status === 'sent' && (
                <motion.p
                  role="status"
                  initial={{ opacity: 0, transform: 'translateY(-8px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="bg-chalk px-5 py-4 text-sm leading-relaxed text-void"
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
          {/* <button>, no <a href="#">: un href real, aunque apunte a la
              propia página, es un destino que el clic derecho ("abrir en
              pestaña nueva"), el clic del medio o arrastrar el enlace pueden
              seguir sin pasar por el `onClick` y, con él, sin el aviso de
              demo. Un botón no tiene esos caminos alternativos. */}
          <button
            type="button"
            onClick={() => {
              showDemoToast('Esto es una demo: en un sitio real este enlace llevaría al mapa del negocio.')
            }}
            className="mt-3 inline-block border-b-2 border-chalk py-1 font-mono text-xs uppercase tracking-[0.14em] text-chalk transition-opacity duration-150 can-hover:hover:opacity-60"
          >
            Ver en Google Maps
          </button>

          <h3 className="label mt-12">Contacto directo</h3>
          {/* py-2 en los botones: en móvil son el objetivo táctil principal de
              esta columna y con solo la altura de línea se quedan en 20px.
              <button>, no <a href="#">: sin un `href` real detrás no hay
              destino que un clic derecho, el clic del medio o arrastrar el
              enlace puedan seguir saltándose el aviso de demo. */}
          <p className="mt-2 flex flex-col font-mono text-sm">
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
        </Reveal>
      </div>
    </section>
  )
}

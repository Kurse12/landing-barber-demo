import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { gsap, useGSAP, motionSafe } from '../lib/gsap'
import { formatPrice, services } from '../data/site'
import { handleAnchorClick } from '../lib/scroll'
import { useReducedMotionPolicy } from '../hooks/useMotionPolicy'
import SectionHeading from './ui/SectionHeading'

const PREVIEW_W = 240
const PREVIEW_H = 300

export default function Services({ onSelectService }) {
  const root = useRef(null)
  const reduced = useReducedMotionPolicy()
  const [canHover, setCanHover] = useState(false)
  const [active, setActive] = useState(null)

  /*
    La posición del cursor vive en motion values, no en estado de React. Con
    `useState` cada pixel de movimiento re-renderizaría la sección entera; con
    motion values Motion escribe el transform directo en el nodo. El estado sí
    guarda qué fila está activa, que cambia una vez por fila, no por frame.
  */
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { stiffness: 220, damping: 26, mass: 0.5 })
  const springY = useSpring(pointerY, { stiffness: 220, damping: 26, mass: 0.5 })

  const transform = useTransform(
    [springX, springY],
    ([x, y]) => `translate3d(${x - PREVIEW_W / 2}px, ${y - PREVIEW_H / 2}px, 0)`,
  )

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    setCanHover(mq.matches)
    const onChange = (event) => setCanHover(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useGSAP(
    () => {
      const mm = motionSafe(() => {
        // Cada fila entra con su propio trigger: con un stagger global, las
        // últimas ya estarían animadas al llegar a ellas.
        gsap.utils.toArray('[data-service-row]').forEach((row) => {
          gsap.fromTo(
            row,
            { yPercent: 22, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.8,
              ease: 'expo.out',
              scrollTrigger: { trigger: row, start: 'top 92%' },
            },
          )
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const showPreview = canHover && !reduced
  const activeService = services.find((service) => service.id === active)

  return (
    <section id="servicios" ref={root} className="bg-void">
      <div className="shell pb-16 pt-24 md:pt-32">
        <SectionHeading
          title="La carta"
          meta={`${services.length} servicios`}
          subtitle="Precios cerrados y tiempos reales. Lo que ves es lo que pagás."
        />
      </div>

      {/*
        Sin reglas entre filas ni entre columnas. Lo que mantiene legible una
        lista de seis precios sin retícula dibujada es la alineación: el número
        de índice, la duración y el importe van en mono tabular, así que forman
        columnas reales aunque no haya ninguna línea marcándolas.

        El hover sigue invirtiendo la fila entera. Esa plancha de tiza es ahora
        la única marca de estado que hay, y por eso tiene que ser total.
      */}
      <ul
        className="shell"
        onPointerMove={
          showPreview
            ? (event) => {
                pointerX.set(event.clientX)
                pointerY.set(event.clientY)
              }
            : undefined
        }
        onPointerEnter={
          showPreview
            ? (event) => {
                // Salto instantáneo: sin esto el preview entra volando desde
                // la esquina superior izquierda la primera vez.
                springX.jump(event.clientX)
                springY.jump(event.clientY)
              }
            : undefined
        }
        onPointerLeave={showPreview ? () => setActive(null) : undefined}
      >
        {services.map((service, i) => (
          <li key={service.id} data-service-row>
            <a
              href="#reserva"
              onClick={handleAnchorClick('reserva', () => onSelectService(service.id))}
              onPointerEnter={showPreview ? () => setActive(service.id) : undefined}
              onFocus={() => setActive(service.id)}
              onBlur={() => setActive(null)}
              className="group -mx-4 grid grid-cols-[2.5rem_1fr] items-baseline gap-x-2 px-4 py-8 transition-colors duration-150 can-hover:hover:bg-chalk can-hover:hover:text-void md:-mx-6 md:grid-cols-[4rem_1fr_6rem_10rem] md:gap-x-6 md:px-6 md:py-9"
            >
              {/* El número no es una etiqueta decorativa: es el índice de una
                  carta de precios, que es como se numeran las cartas. */}
              <span className="font-mono text-xs tabular-nums text-chalk-2 can-hover:group-hover:text-void/70">
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="flex flex-col">
                <span className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <h3 className="text-big text-chalk can-hover:group-hover:text-void">
                    {service.name}
                  </h3>
                  {service.featured && (
                    <span className="border-2 border-chalk px-2 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-chalk can-hover:group-hover:border-void can-hover:group-hover:text-void">
                      Más pedido
                    </span>
                  )}
                </span>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-chalk-2 can-hover:group-hover:text-void/70">
                  {service.description}
                </p>

                {/*
                  En móvil no hay columnas ni hay cursor. Los datos bajan bajo
                  el nombre y la foto entra en la propia fila: en escritorio la
                  ves siguiendo el puntero, en el teléfono la tenés ahí. No es
                  la versión recortada de la de escritorio, es la equivalente
                  para un dedo.
                */}
                <span className="mt-6 flex items-center gap-5 md:hidden">
                  <picture>
                    <source srcSet={service.previewWebp} type="image/webp" />
                    <img
                      src={service.preview}
                      alt=""
                      loading="lazy"
                      className="h-20 w-16 shrink-0 object-cover grayscale contrast-125"
                    />
                  </picture>
                  <span className="flex flex-col gap-1 font-mono">
                    <span className="text-xs tabular-nums text-chalk-2 can-hover:group-hover:text-void/70">
                      {service.duration} min
                    </span>
                    <span className="text-3xl font-bold tabular-nums text-chalk can-hover:group-hover:text-void">
                      {formatPrice(service.price)}
                    </span>
                  </span>
                </span>
              </span>

              <span className="hidden font-mono text-xs tabular-nums text-chalk-2 can-hover:group-hover:text-void/70 md:block">
                {service.duration} min
              </span>

              <span className="hidden text-right font-mono text-3xl font-bold tabular-nums text-chalk can-hover:group-hover:text-void md:block">
                {formatPrice(service.price)}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {showPreview && (
        // Dos capas: la de afuera solo lleva la posición (el transform que
        // escribe el motion value), la de adentro solo la entrada. En un mismo
        // nodo, Motion compondría la escala encima de la posición y se pisan.
        <motion.div
          aria-hidden="true"
          style={{ transform, width: PREVIEW_W, height: PREVIEW_H }}
          className="pointer-events-none fixed left-0 top-0 z-30 will-change-transform"
        >
          <AnimatePresence>
            {activeService && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className="h-full w-full overflow-hidden bg-void-2"
              >
                <picture>
                  <source srcSet={activeService.previewWebp} type="image/webp" />
                  <img
                    src={activeService.preview}
                    alt=""
                    className="h-full w-full object-cover grayscale contrast-125"
                  />
                </picture>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { gsap, ScrollTrigger, useGSAP, motionSafe } from '../lib/gsap'
import { business, gallery } from '../data/site'
import { useReducedMotionPolicy } from '../hooks/useMotionPolicy'
import { showDemoToast } from '../lib/demoToast'
import SectionHeading from './ui/SectionHeading'

const EASE = [0.23, 1, 0.32, 1]

// Demo: el botón no lleva a ningún perfil real, avisa por qué. Es un
// <button>, no un <a href="#"> (ver la lámina más abajo): sin `href` real
// detrás no hay URL que un clic derecho o el clic del medio puedan seguir
// sin pasar por el aviso.
const handleInstagramClick = () => {
  showDemoToast('Esto es una demo: en un sitio real este enlace llevaría al Instagram del negocio.')
}

export default function Gallery() {
  const root = useRef(null)
  const wrap = useRef(null)
  const track = useRef(null)
  const reduced = useReducedMotionPolicy()
  const [open, setOpen] = useState(null)
  const closeBtnRef = useRef(null)
  const lastFocusedRef = useRef(null)

  useGSAP(
    () => {
      const mm = motionSafe(() => {
        /*
          El scroll vertical mueve la tira en horizontal. Es el único sitio de
          la página donde el hijack está justificado: son fotos que se miran en
          secuencia, y la secuencia es el contenido.

          Solo en escritorio. En un teléfono el usuario ya tiene un gesto
          horizontal nativo mejor que cualquier pin, así que ahí la tira es un
          scroll con snap normal.
        */
        const desktop = gsap.matchMedia()

        desktop.add('(min-width: 768px)', () => {
          const distance = () => track.current.scrollWidth - window.innerWidth

          const tween = gsap.to(track.current, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: wrap.current,
              // top top y pin: la sección se ancla cuando su borde superior
              // toca el de la ventana. Con `top center` el usuario ve media
              // diapositiva antes de que empiece el pan.
              start: 'top top',
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 1,
              // Las imágenes cargan en diferido: si el ancho del track cambia
              // después de medir, el pan se corta antes de llegar al final.
              invalidateOnRefresh: true,
            },
          })

          return () => tween.kill()
        })

        return () => desktop.revert()
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  const remeasure = () => ScrollTrigger.refresh()

  useEffect(() => {
    if (open === null) return
    const onKey = (event) => event.key === 'Escape' && setOpen(null)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  /*
    El diálogo se porta a <body>, así que `inert` en header/main/footer no lo
    alcanza a él pero sí a todo lo que queda tapado detrás: sin esto, Tab podía
    llegar a un enlace cubierto por el fondo macizo del lightbox. El foco entra
    en "Cerrar" al abrir y vuelve a la lámina que lo disparó al cerrar.
  */
  useEffect(() => {
    const targets = [
      document.querySelector('header'),
      document.querySelector('main'),
      document.querySelector('footer'),
      document.getElementById('mobile-bar'),
    ].filter(Boolean)

    if (open !== null) {
      lastFocusedRef.current = document.activeElement
      targets.forEach((el) => {
        el.inert = true
      })
      closeBtnRef.current?.focus()
    } else {
      targets.forEach((el) => {
        el.inert = false
      })
      lastFocusedRef.current?.focus?.()
    }

    return () => {
      targets.forEach((el) => {
        el.inert = false
      })
    }
  }, [open])

  const item = open === null ? null : gallery[open]

  return (
    <section id="galeria" ref={root} className="bg-void">
      <div className="shell pb-14 pt-24 md:pt-32">
        <SectionHeading
          title="El trabajo"
          meta="Últimas semanas"
          subtitle="Una muestra de cortes y afeitados salidos de estos sillones."
          className="max-w-4xl"
        />
      </div>

      {/* Sin reglas entre láminas: las separa el hueco. Con `gap` la tira se
          lee como una secuencia de copias sueltas y no como una tabla. */}
      <div
        ref={wrap}
        className="relative overflow-x-auto pb-20 md:h-[100dvh] md:overflow-hidden md:pb-0"
      >
        <div
          ref={track}
          className="flex w-max snap-x snap-mandatory items-stretch gap-4 px-4 md:h-full md:items-center md:gap-8 md:px-6"
        >
          {gallery.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Ampliar: ${photo.alt}`}
              className="group shrink-0 snap-center text-left transition-transform duration-150 ease-out-strong active:translate-y-[2px]"
            >
              <span className="block h-[52vh] w-[76vw] overflow-hidden bg-void-2 sm:w-[48vw] md:h-[62vh] md:w-[clamp(320px,30vw,520px)]">
                <picture>
                  <source srcSet={photo.webp} type="image/webp" />
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    onLoad={remeasure}
                    className="h-full w-full object-cover grayscale contrast-125 transition-transform duration-200 ease-out-strong can-hover:group-hover:scale-105"
                  />
                </picture>
              </span>

              {/* Pie de lámina fuera del encuadre, no superpuesto: una etiqueta
                  encima de la foto tapa justo lo que se quiere mirar. */}
              <span className="mt-4 flex items-baseline justify-between gap-4">
                <span className="max-w-[80%] font-sans text-xs leading-snug text-chalk-2">
                  {photo.alt}
                </span>
                <span className="font-mono text-xs tabular-nums text-chalk-2">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </span>
            </button>
          ))}

          {/* Última lámina: cierra la tira y lleva al perfil. */}
          <button
            type="button"
            onClick={handleInstagramClick}
            className="group flex h-[52vh] w-[76vw] shrink-0 snap-center flex-col justify-between bg-chalk p-6 text-left text-void transition-opacity duration-150 can-hover:hover:opacity-80 sm:w-[48vw] md:h-[62vh] md:w-[clamp(320px,30vw,520px)]"
          >
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-void/60">
              Más trabajos
            </span>
            <span>
              <span className="block font-display text-5xl uppercase leading-[0.85] tracking-tight md:text-6xl">
                Seguinos en Instagram
              </span>
              <span className="mt-6 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-void/70">
                {business.instagramHandle}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-150 ease-out-strong group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </span>
            </span>
          </button>
        </div>
      </div>

      {/*
        El lightbox entra centrado y desde scale(0.95), no desde la miniatura:
        una animación de elemento compartido tendría que medir posiciones dentro
        de un contenedor que GSAP está trasladando, y salta. Además un modal no
        está anclado a un disparador concreto, así que centrado es lo correcto.
      */}
      {createPortal(
        <AnimatePresence>
          {item && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={item.alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.18, ease: EASE }}
              onClick={() => setOpen(null)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-void p-4 md:p-12"
            >
              <picture onClick={(event) => event.stopPropagation()}>
                <source srcSet={item.webp} type="image/webp" />
                <motion.img
                  src={item.src}
                  alt={item.alt}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: reduced ? 0 : 0.22, ease: EASE }}
                  className="max-h-full max-w-full object-contain"
                />
              </picture>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Cerrar"
                className="absolute right-4 top-4 flex h-11 items-center justify-center bg-chalk px-5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.14em] text-void transition-transform duration-150 ease-out-strong active:translate-y-[2px] md:right-10 md:top-10"
              >
                Cerrar
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  )
}

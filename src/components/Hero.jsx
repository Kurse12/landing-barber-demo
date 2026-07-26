import { useEffect, useRef, useState } from 'react'
import { gsap, SplitText, useGSAP, motionSafe } from '../lib/gsap'
import { business, images, stats } from '../data/site'
import { handleAnchorClick } from '../lib/scroll'
import Button from './ui/Button'

const formatStat = (value, decimals) =>
  value.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

const RISE = { autoAlpha: 0, y: 24 }
const SETTLE = { autoAlpha: 1, y: 0 }

export default function Hero() {
  const root = useRef(null)
  const title = useRef(null)
  const [fontsReady, setFontsReady] = useState(false)

  // SplitText mide líneas: si parte antes de que cargue la serif, corta donde no es.
  useEffect(() => {
    let cancelled = false
    document.fonts.ready.then(() => !cancelled && setFontsReady(true))
    return () => {
      cancelled = true
    }
  }, [])

  // Un único hook para ocultar y para animar. Si se reparte en dos, el segundo
  // captura el estado ya oculto del primero y los tweens animan de 0 a 0.
  useGSAP(
    () => {
      let split
      const mm = motionSafe(() => {
        // Estado inicial, aplicado antes del primer pintado (useLayoutEffect).
        gsap.set('[data-hero-anim]', { autoAlpha: 0 })
        gsap.set('[data-hero-media]', { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.18 })

        // Esperamos a la tipografía antes de partir el titular en líneas.
        if (!fontsReady) return

        split = SplitText.create(title.current, { type: 'lines', mask: 'lines' })

        // Todo con fromTo: los valores de inicio y fin son explícitos, así que
        // no dependen de lo que hubiera en el DOM al construir la timeline.
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

        tl.fromTo(
          '[data-hero-eyebrow]',
          { autoAlpha: 0, yPercent: 100 },
          { autoAlpha: 1, yPercent: 0, duration: 0.9 },
        )
          .set(title.current, { autoAlpha: 1 }, '<')
          .fromTo(
            split.lines,
            { yPercent: 115 },
            { yPercent: 0, duration: 1.3, stagger: 0.09 },
            '-=0.6',
          )
          .fromTo('[data-hero-text]', RISE, { ...SETTLE, duration: 1 }, '-=0.9')
          .fromTo(
            '[data-hero-cta]',
            RISE,
            { ...SETTLE, duration: 0.9, stagger: 0.1 },
            '-=0.8',
          )
          .fromTo(
            '[data-hero-stat]',
            RISE,
            { ...SETTLE, duration: 0.9, stagger: 0.08 },
            '-=0.75',
          )
          .fromTo('[data-hero-cue]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, '-=0.5')
          .to(
            '[data-hero-media]',
            { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.6 },
            0.15,
          )

        // Contadores: animamos un objeto y escribimos el texto ya formateado.
        stats.forEach((stat) => {
          const el = root.current.querySelector(`[data-counter="${stat.id}"]`)
          const proxy = { value: 0 }
          tl.to(
            proxy,
            {
              value: stat.to,
              duration: 1.6,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = `${stat.prefix ?? ''}${formatStat(proxy.value, stat.decimals)}`
              },
            },
            '-=1.4',
          )
        })

        // Parallax suave del retrato mientras se sale de pantalla.
        gsap.to('[data-hero-media-inner]', {
          yPercent: 14,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      })

      return () => {
        split?.revert()
        mm.revert()
      }
    },
    { scope: root, dependencies: [fontsReady] },
  )

  return (
    <section
      id="inicio"
      ref={root}
      className="relative overflow-hidden border-b border-line bg-ink"
    >
      <div className="mx-auto grid min-h-svh max-w-7xl items-center gap-12 px-5 pb-16 pt-28 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:pt-24">
        <div className="lg:col-span-7">
          <div className="overflow-hidden">
            <p className="eyebrow" data-hero-anim data-hero-eyebrow>
              {business.tagline}
            </p>
          </div>

          <h1 ref={title} data-hero-anim className="mt-6 text-display text-bone">
            {business.claim.lead}{' '}
            <em className="italic text-brass">{business.claim.tail}</em>
          </h1>

          <p
            data-hero-anim
            data-hero-text
            className="mt-7 max-w-md text-balance leading-relaxed text-muted"
          >
            Sin colas, sin apuro y sin sorpresas en el precio. Sacá tu turno en menos de
            un minuto y sentate a que te atendamos.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span data-hero-anim data-hero-cta className="inline-block">
              <Button as="a" href="#reserva" onClick={handleAnchorClick('reserva')}>
                Sacar turno
              </Button>
            </span>
            <span data-hero-anim data-hero-cta className="inline-block">
              <Button
                as="a"
                variant="ghost"
                href="#servicios"
                onClick={handleAnchorClick('servicios')}
              >
                Ver servicios
              </Button>
            </span>
          </div>

          <dl className="mt-9 grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-6 sm:gap-8">
            {stats.map((stat) => (
              // flex-col-reverse: el número se ve arriba, pero en el DOM
              // el <dt> va antes que su <dd>, como pide la semántica de <dl>.
              <div key={stat.id} data-hero-anim data-hero-stat className="flex flex-col-reverse">
                <dt className="mt-1 font-sans text-[0.62rem] uppercase tracking-[0.12em] text-muted sm:text-[0.7rem] sm:tracking-[0.14em]">
                  {stat.label}
                </dt>
                <dd
                  data-counter={stat.id}
                  className="font-display text-2xl text-bone tabular-nums sm:text-3xl lg:text-4xl"
                >
                  {`${stat.prefix ?? ''}${formatStat(stat.to, stat.decimals)}`}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5">
          <div
            data-hero-media
            className="relative aspect-[4/5] overflow-hidden will-change-transform"
          >
            {/* Es la imagen LCP: se carga con prioridad, sin lazy. */}
            <img
              data-hero-media-inner
              src={images.hero.src}
              alt={images.hero.alt}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full scale-110 object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
          </div>
        </div>
      </div>

      <div
        data-hero-anim
        data-hero-cue
        className="pointer-events-none absolute inset-x-0 bottom-5 mx-auto hidden max-w-7xl items-center gap-3 px-5 lg:flex lg:px-10"
      >
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-muted">
          Deslizá
        </span>
        <span className="relative h-px w-16 overflow-hidden bg-line">
          <span className="absolute inset-y-0 left-0 w-1/2 animate-[cue_2.4s_ease-in-out_infinite] bg-brass" />
        </span>
      </div>

      <style>{`
        @keyframes cue {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </section>
  )
}

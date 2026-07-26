import { useRef } from 'react'
import { gsap, useGSAP, motionSafe } from '../lib/gsap'
import { images } from '../data/site'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

const values = [
  {
    id: 'v1',
    title: 'Oficio, no moda',
    text: 'Tijera, navaja y máquina. Técnicas de siempre aplicadas a lo que usás hoy.',
  },
  {
    id: 'v2',
    title: 'Tu tiempo importa',
    text: 'Trabajamos solo con turno para que entres y salgas a horario.',
  },
  {
    id: 'v3',
    title: 'Producto honesto',
    text: 'Cosmética natural argentina, sin siliconas ni promesas raras.',
  },
]

export default function About() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = motionSafe(() => {
        gsap.fromTo(
          '[data-about-media]',
          { clipPath: 'inset(0% 0% 100% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.4,
            ease: 'expo.out',
            scrollTrigger: { trigger: '[data-about-media]', start: 'top 85%' },
          },
        )

        gsap.to('[data-about-media-inner]', {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-about-media]',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="nosotros" ref={root} className="border-b border-line bg-coal">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 lg:grid-cols-12 lg:gap-20 lg:px-10 lg:py-32">
        <div className="lg:col-span-5">
          <div
            data-about-media
            className="relative aspect-[3/4] overflow-hidden will-change-transform"
          >
            <img
              data-about-media-inner
              src={images.about.src}
              alt={images.about.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-115 object-cover"
            />
          </div>

          <Reveal delay={0.15} className="mt-6 flex items-center gap-4">
            <span className="h-px w-10 bg-brass" />
            <p className="font-sans text-xs uppercase tracking-[0.18em] text-muted">
              Defensa 1024 · desde 2003
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <SectionHeading index="02" eyebrow="La casa" title="Veintidós años en el mismo local" />

          <Reveal as="p" delay={0.1} className="mt-8 max-w-xl leading-relaxed text-muted">
            Navaja &amp; Roble abrió en 2003 en un local de la calle Defensa con dos
            sillones de segunda mano. Veintidós años después seguimos en el mismo lugar,
            con los mismos sillones restaurados y bastantes más clientes.
          </Reveal>

          <Reveal as="p" delay={0.16} className="mt-5 max-w-xl leading-relaxed text-muted">
            No somos un lugar de moda: somos la barbería a la que volvés. Acá te
            preguntamos qué querés, te decimos qué te va a quedar bien y te lo hacemos
            igual de bien un martes a la mañana que un viernes a última hora.
          </Reveal>

          <ul className="mt-14 grid gap-px bg-line sm:grid-cols-3">
            {values.map((value, i) => (
              <Reveal
                as="li"
                key={value.id}
                delay={0.1 + i * 0.08}
                className="bg-coal p-6"
              >
                <span className="font-sans text-xs text-brass-dim tabular-nums">
                  0{i + 1}
                </span>
                <h3 className="mt-4 text-2xl text-bone">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{value.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

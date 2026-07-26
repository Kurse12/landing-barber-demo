import { useRef } from 'react'
import { gsap, useGSAP, motionSafe } from '../lib/gsap'
import { formatPrice, services } from '../data/site'
import { handleAnchorClick } from '../lib/scroll'
import SectionHeading from './ui/SectionHeading'

export default function Services() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = motionSafe(() => {
        // Cada fila entra con su propio trigger: si la lista es larga, el
        // stagger global dejaría las últimas ya animadas al llegar a ellas.
        gsap.utils.toArray('[data-service-row]').forEach((row) => {
          gsap.from(row, {
            yPercent: 40,
            opacity: 0,
            duration: 0.9,
            ease: 'expo.out',
            scrollTrigger: { trigger: row, start: 'top 88%' },
          })
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="servicios" ref={root} className="border-b border-line bg-ink">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-10 lg:py-32">
        <SectionHeading
          index="01"
          eyebrow="La carta"
          title="Servicios y precios"
          subtitle="Precios cerrados y tiempos reales. Lo que ves es lo que pagás."
        />

        <ul className="mt-16 border-t border-line">
          {services.map((service) => (
            <li key={service.id} data-service-row className="border-b border-line">
              <a
                href="#reserva"
                onClick={handleAnchorClick('reserva')}
                className="group relative flex flex-col gap-3 py-8 transition-colors duration-500 md:flex-row md:items-center md:gap-8"
              >
                {/* Barrido de fondo en hover, contenido por encima. */}
                <span className="absolute inset-x-[-1rem] inset-y-0 origin-left scale-x-0 bg-surface transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />

                <span className="relative flex flex-1 flex-col gap-2 md:flex-row md:items-baseline md:gap-6">
                  <span className="flex items-baseline gap-4">
                    <h3 className="text-3xl text-bone transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 md:text-4xl">
                      {service.name}
                    </h3>
                    {service.featured && (
                      <span className="border border-brass-dim px-2 py-1 font-sans text-[0.6rem] uppercase tracking-[0.16em] text-brass">
                        Más pedido
                      </span>
                    )}
                  </span>
                  <p className="max-w-sm text-sm leading-relaxed text-muted transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                    {service.description}
                  </p>
                </span>

                <span className="relative flex items-center gap-8">
                  <span className="font-sans text-xs uppercase tracking-[0.14em] text-muted tabular-nums">
                    {service.duration} min
                  </span>
                  <span className="font-display text-3xl text-brass tabular-nums md:text-4xl">
                    {formatPrice(service.price)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="hidden text-brass opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:opacity-100 md:block"
                  >
                    →
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

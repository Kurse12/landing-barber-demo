import { useRef } from 'react'
import { gsap, useGSAP, motionSafe } from '../lib/gsap'
import { business, gallery } from '../data/site'
import SectionHeading from './ui/SectionHeading'

export default function Gallery() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = motionSafe(() => {
        gsap.utils.toArray('[data-gallery-item]').forEach((item) => {
          gsap.fromTo(
            item,
            { clipPath: 'inset(0% 0% 100% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.1,
              ease: 'expo.out',
              scrollTrigger: { trigger: item, start: 'top 90%' },
            },
          )
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="galeria" ref={root} className="border-b border-line bg-coal">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-10 lg:py-32">
        <SectionHeading
          index="04"
          eyebrow="El trabajo"
          title="Lo que sale de estos sillones"
          subtitle="Una muestra de cortes y afeitados de las últimas semanas."
        />

        {/* Celdas 3:4 iguales: las fotos son verticales y así apenas se recortan. */}
        <ul className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {gallery.map((item) => (
            <li
              key={item.id}
              data-gallery-item
              className="group relative aspect-[3/4] overflow-hidden bg-surface"
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-ink to-transparent p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="font-sans text-[0.7rem] uppercase tracking-[0.14em] text-bone">
                  {item.alt}
                </span>
              </span>
            </li>
          ))}

          {/* Sexta celda: cierra la retícula y lleva al perfil. */}
          <li data-gallery-item className="aspect-[3/4]">
            <a
              href={business.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col justify-between border border-line bg-surface p-4 transition-colors duration-500 hover:border-brass lg:p-6"
            >
              <span className="eyebrow">Más trabajos</span>
              <span>
                {/* Texto con espacios a propósito: "@navajayroble" es una sola
                    palabra de 13 caracteres y a este cuerpo no entra en media
                    columna de móvil, así que va abajo en pequeño. */}
                <span className="block font-display text-xl leading-tight text-bone transition-colors duration-300 group-hover:text-brass sm:text-2xl lg:text-3xl">
                  Seguinos en Instagram
                </span>
                <span className="mt-3 flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-[0.12em] text-muted lg:text-[0.7rem]">
                  @navajayroble
                  <span
                    aria-hidden="true"
                    className="text-brass transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  )
}

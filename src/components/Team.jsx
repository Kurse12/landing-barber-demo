import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { team } from '../data/site'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

export default function Team() {
  const root = useRef(null)

  useGSAP(
    () => {
      // En escritorio el color lo revela el hover (ver can-hover: en las clases).
      // En táctil no hay hover, así que lo revela el scroll: ponemos el gris
      // desde JS y lo quitamos al entrar en pantalla. Si el JS fallara, el CSS
      // deja las fotos a color, que es el estado correcto por defecto.
      const mm = gsap.matchMedia()

      mm.add('(hover: none)', () => {
        gsap.utils.toArray('[data-member-photo]').forEach((photo) => {
          gsap.fromTo(
            photo,
            { filter: 'grayscale(1)' },
            {
              filter: 'grayscale(0)',
              duration: 1.1,
              ease: 'power2.out',
              scrollTrigger: { trigger: photo, start: 'top 80%' },
            },
          )
        })
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="equipo" ref={root} className="border-b border-line bg-ink">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-10 lg:py-32">
        <SectionHeading
          index="03"
          eyebrow="Las manos"
          title="El equipo"
          subtitle="Elegí con quién querés sentarte, o dejalo en manos del primero que esté libre."
        />

        <ul className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, i) => (
            <Reveal as="li" key={member.id} delay={i * 0.1} className="group">
              <a
                href={member.instagram}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                  {member.photo ? (
                    <img
                      data-member-photo
                      src={member.photo}
                      alt={member.name}
                      loading="lazy"
                      // transition-transform, no transition-all: si el navegador
                      // interpolara también el filter, pelearía con GSAP.
                      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] can-hover:grayscale group-hover:scale-105 group-hover:grayscale-0"
                    />
                  ) : (
                    <div
                      role="img"
                      aria-label={member.name}
                      className="placeholder-art h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />

                  <span className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-brass">
                      {member.role}
                    </span>
                    <span
                      aria-hidden="true"
                      className="translate-y-2 text-brass opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      ↗
                    </span>
                  </span>
                </div>

                <h3 className="mt-5 text-3xl text-bone transition-colors duration-300 group-hover:text-brass">
                  {member.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{member.bio}</p>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

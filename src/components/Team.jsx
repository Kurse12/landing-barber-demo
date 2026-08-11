import { useRef } from 'react'
import { gsap, useGSAP, motionSafe } from '../lib/gsap'
import { team } from '../data/site'
import { showDemoToast } from '../lib/demoToast'
import SectionHeading from './ui/SectionHeading'

// Demo: el enlace no lleva a ningún perfil real, avisa por qué. Cada barbero
// tiene su propio Instagram (no uno compartido), así que el aviso nombra a
// quién correspondía: decir solo "del barbero" borraría esa diferencia entre
// las tres filas y el aviso mentiría por omisión sobre a dónde iba cada una.
//
// El `href` real de cada barbero vive solo en `member.instagram` (dato), no
// en el atributo `href` del enlace: así no queda una URL real detrás del
// clic que un click medio o "abrir en pestaña nueva" puedan seguir.
const handleInstagramClick = (name) => (event) => {
  event.preventDefault()
  showDemoToast(`Esto es una demo: en un sitio real este enlace llevaría al Instagram de ${name}.`)
}

// Profundidad de parallax por retrato. Que no sean iguales es lo que separa los
// planos ahora que no hay celdas dibujadas que los separen.
const DEPTHS = [8, 16, 11]

export default function Team() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = motionSafe(() => {
        gsap.utils.toArray('[data-member-frame]').forEach((frame) => {
          const photo = frame.querySelector('[data-member-photo]')
          const depth = Number(frame.dataset.depth) || 10

          gsap.fromTo(
            photo,
            { yPercent: depth },
            {
              yPercent: -depth,
              ease: 'none',
              scrollTrigger: {
                trigger: frame,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )

          gsap.fromTo(
            frame,
            { clipPath: 'inset(0% 0% 100% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.1,
              ease: 'expo.out',
              scrollTrigger: { trigger: frame, start: 'top 90%' },
            },
          )
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="equipo" ref={root} className="bg-void">
      <div className="shell pb-24 pt-24 md:pb-32 md:pt-32">
        <SectionHeading
          title="Las manos"
          meta={`${team.length} barberos`}
          subtitle="Elegí con quién querés sentarte, o dejalo en manos del primero que esté libre."
          className="max-w-4xl"
        />

        <ul className="mt-20 grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
          {team.map((member, i) => (
            <li key={member.id}>
              <a
                href="#"
                onClick={handleInstagramClick(member.name)}
                className="group block"
              >
                <div
                  data-member-frame
                  data-depth={DEPTHS[i] ?? 10}
                  className="relative aspect-[4/5] overflow-hidden bg-void-2"
                >
                  {member.photo ? (
                    <picture>
                      <source srcSet={member.photoWebp} type="image/webp" />
                      <img
                        data-member-photo
                        src={member.photo}
                        alt={member.name}
                        loading="lazy"
                        /* En un sistema monocromo el hover no puede virar a color,
                           así que lo que cambia es el rango: la foto se aclara y
                           se despega del fondo. Solo `filter`, sin tocar el
                           transform, que lo está escribiendo el parallax. */
                        className="absolute inset-0 h-full w-full scale-115 object-cover grayscale contrast-125 transition-[filter] duration-200 ease-out-strong can-hover:group-hover:brightness-125 can-hover:group-hover:contrast-100 will-change-transform"
                      />
                    </picture>
                  ) : (
                    <div
                      data-member-photo
                      role="img"
                      aria-label={member.name}
                      className="placeholder-art absolute inset-0 h-full w-full scale-115"
                    />
                  )}
                </div>

                <h3 className="mt-7 text-big text-chalk">{member.name}</h3>
                <p className="label mt-3">{member.role}</p>
                <p className="mt-4 max-w-sm leading-relaxed text-chalk-2">{member.bio}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-chalk-2 transition-colors duration-150 group-hover:text-chalk">
                  Ver en Instagram
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-150 ease-out-strong group-hover:translate-x-1"
                  >
                    &rarr;
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

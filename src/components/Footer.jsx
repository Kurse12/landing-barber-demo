import { useRef } from 'react'
import { gsap, useGSAP, motionSafe } from '../lib/gsap'
import { business, nav } from '../data/site'
import { handleAnchorClick } from '../lib/scroll'
import { showDemoToast } from '../lib/demoToast'
import Reveal from './ui/Reveal'

// `dest` lleva su propia preposición y artículo: "al Instagram del negocio"
// no se arma igual que "a Facebook del negocio", y es la misma cuenta que
// enlaza Gallery, así que el aviso usa la misma forma para no nombrar el
// mismo destino de dos maneras distintas según la sección.
//
// `href` guarda el destino real solo como dato (lo que enlazaría un sitio de
// verdad); ningún elemento interactivo lo usa como atributo `href`, así que
// no hay URL real detrás del enlace que un click medio o "abrir en pestaña
// nueva" puedan seguir sin pasar por el aviso.
const socials = [
  { id: 'ig', label: 'Instagram', dest: 'al Instagram del negocio', href: business.social.instagram },
  { id: 'fb', label: 'Facebook', dest: 'a Facebook del negocio', href: business.social.facebook },
  { id: 'tt', label: 'TikTok', dest: 'a TikTok del negocio', href: business.social.tiktok },
]

// Demo: el enlace no navega a ningún perfil real, avisa por qué.
const handleSocialClick = (dest) => (event) => {
  event.preventDefault()
  showDemoToast(`Esto es una demo: en un sitio real este enlace llevaría ${dest}.`)
}

// Mismo trato que los links sociales: el aviso, no el marcado real, es lo
// único que existe detrás del clic.
const handleContactClick = (dest) => (event) => {
  event.preventDefault()
  showDemoToast(`Esto es una demo: en un sitio real este enlace ${dest}.`)
}

export default function Footer() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = motionSafe(() => {
        // El wordmark gigante sube desde su propia caja recortada: cierra la
        // página con el mismo gesto con el que la abrió el titular.
        gsap.fromTo(
          '[data-footer-mark]',
          { yPercent: 105 },
          {
            yPercent: 0,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: { trigger: '[data-footer-mark-box]', start: 'top 95%' },
          },
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <footer ref={root} className="section-rule bg-void">
      {/*
        Cierre: un último titular a cuerpo de cartel y una sola acción. Mismo
        texto de botón que en el nav y en la portada a propósito: una intención,
        una etiqueta, repetida en toda la página.
      */}
      <div className="shell grid gap-10 py-20 md:grid-cols-[1fr_auto] md:items-end md:py-28">
        <Reveal as="h2" className="text-mega text-chalk">
          ¿Nos vemos
          <br />
          esta semana?
        </Reveal>

        <Reveal delay={0.1}>
          <a
            href="#reserva"
            onClick={handleAnchorClick('reserva')}
            className="group flex items-center justify-between gap-8 border-2 border-chalk bg-chalk px-7 py-5 font-mono text-sm font-bold uppercase tracking-[0.14em] text-void transition-[background-color,color,transform] duration-150 ease-out-strong can-hover:hover:bg-void can-hover:hover:text-chalk active:translate-y-[2px] md:min-w-[20rem]"
          >
            Sacar turno
            <span
              aria-hidden="true"
              className="text-2xl transition-transform duration-150 ease-out-strong group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </a>
        </Reveal>
      </div>

      {/* Cuatro columnas separadas por el hueco de la retícula, no por reglas.
          Con etiquetas en gris y contenido en tiza, la jerarquía ya está. */}
      <div className="shell grid gap-12 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="label">Dónde</p>
          <p className="mt-4 text-sm text-chalk">{business.address}</p>
        </div>

        <div>
          <p className="label">Contacto</p>
          <p className="mt-3 flex flex-col font-mono text-sm">
            <a
              href="#"
              onClick={handleContactClick('abriría el teléfono para llamar')}
              className="w-fit py-1.5 text-chalk transition-opacity duration-150 can-hover:hover:opacity-60"
            >
              {business.phone}
            </a>
            <a
              href="#"
              onClick={handleContactClick('abriría el correo para escribir')}
              className="w-fit py-1.5 text-chalk-2 transition-colors duration-150 can-hover:hover:text-chalk"
            >
              {business.email}
            </a>
          </p>
        </div>

        <nav aria-label="Secciones">
          <p className="label">Secciones</p>
          <ul className="mt-3 flex flex-col text-sm [&_a]:w-fit [&_a]:py-1.5">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={handleAnchorClick(item.id)}
                  className="text-chalk-2 transition-colors duration-150 can-hover:hover:text-chalk"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="label">Seguinos</p>
          <ul className="mt-3 flex flex-col text-sm [&_a]:w-fit [&_a]:py-1.5">
            {socials.map((social) => (
              <li key={social.id}>
                <a
                  href="#"
                  onClick={handleSocialClick(social.dest)}
                  className="text-chalk-2 transition-colors duration-150 can-hover:hover:text-chalk"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Wordmark a sangre, recortado por los bordes de la página: el cartel
          es más grande que el papel. */}
      <div data-footer-mark-box className="overflow-hidden px-4 pb-6 md:px-6">
        <p
          data-footer-mark
          aria-hidden="true"
          className="block whitespace-nowrap font-display text-[19vw] uppercase leading-[0.8] tracking-[-0.05em] text-chalk"
        >
          {business.name}
        </p>
      </div>

      {/* Aviso de demo: mismo cuerpo que la etiqueta de sección, para que se
          lea como dato del sitio y no como una disculpa aparte. */}
      <p className="shell pb-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-chalk-2">
        Proyecto de demostración de diseño y desarrollo. No es un negocio real.
      </p>

      <div className="shell flex flex-col gap-3 pb-8 font-mono text-xs text-chalk-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {business.name}
        </p>
        <ul className="flex gap-6">
          {['Términos', 'Privacidad', 'Cookies'].map((label) => (
            <li key={label}>
              {/* Sin página real detrás: mismo aviso de demo que el resto de
                  los enlaces que no navegan a ningún lado. Un `href="#"` sin
                  manejar saltaría al tope de la página sin avisar por qué. */}
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  showDemoToast(`Esto es una demo: en un sitio real este enlace llevaría a la página de ${label}.`)
                }}
                className="transition-colors duration-150 can-hover:hover:text-chalk"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}

import { useRef } from 'react'
import { gsap, useGSAP, motionSafe } from '../lib/gsap'
import { business, nav } from '../data/site'
import { handleAnchorClick } from '../lib/scroll'

const socials = [
  { id: 'ig', label: 'Instagram', href: business.social.instagram },
  { id: 'fb', label: 'Facebook', href: business.social.facebook },
  { id: 'tt', label: 'TikTok', href: business.social.tiktok },
]

export default function Footer() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = motionSafe(() => {
        // El wordmark gigante sube al entrar: cierra la página con peso.
        gsap.from('[data-footer-mark]', {
          yPercent: 30,
          opacity: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-footer-mark]', start: 'top 95%' },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <footer ref={root} className="bg-ink">
      <div className="mx-auto max-w-7xl px-5 pt-20 lg:px-10">
        <div className="grid gap-10 border-b border-line pb-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="eyebrow">Dónde</p>
            <p className="mt-4 text-sm text-muted">{business.address}</p>
          </div>

          <div>
            <p className="eyebrow">Contacto</p>
            <p className="mt-2 flex flex-col text-sm">
              <a href={`tel:${business.phoneHref}`} className="w-fit py-1.5 text-muted transition-colors hover:text-brass">
                {business.phone}
              </a>
              <a href={`mailto:${business.email}`} className="w-fit py-1.5 text-muted transition-colors hover:text-brass">
                {business.email}
              </a>
            </p>
          </div>

          <nav aria-label="Secciones">
            <p className="eyebrow">Secciones</p>
            <ul className="mt-2 flex flex-col text-sm [&_a]:w-fit [&_a]:py-1.5">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={handleAnchorClick(item.id)}
                    className="text-muted transition-colors hover:text-brass"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow">Síguenos</p>
            <ul className="mt-2 flex flex-col text-sm [&_a]:w-fit [&_a]:py-1.5">
              {socials.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted transition-colors hover:text-brass"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="overflow-hidden py-10">
          <p
            data-footer-mark
            aria-hidden="true"
            className="text-center font-display leading-none text-bone/10 text-[clamp(3rem,15vw,13rem)]"
          >
            {business.name}
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {business.name}
          </p>
          <ul className="flex gap-6">
            <li>
              <a href="#" className="transition-colors hover:text-brass">
                Términos
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-brass">
                Privacidad
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-brass">
                Cookies
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

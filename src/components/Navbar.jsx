import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { business, nav } from '../data/site'
import { handleAnchorClick } from '../lib/scroll'
import { useReducedMotionPolicy } from '../hooks/useMotionPolicy'

const EASE = [0.16, 1, 0.3, 1]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const reduced = useReducedMotionPolicy()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Al pasar a escritorio el panel móvil sobra: si queda abierto, tapa el hero.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = (event) => event.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open
          ? 'border-b border-line bg-ink/85 backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-5 py-4 lg:px-10">
        <a
          href="#inicio"
          onClick={handleAnchorClick('inicio', () => setOpen(false))}
          className="-my-2 py-2 font-display text-xl leading-none text-bone transition-colors hover:text-brass"
        >
          {business.name}
        </a>

        <nav aria-label="Principal" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-8">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={handleAnchorClick(item.id)}
                  className="group relative font-sans text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted transition-colors hover:text-bone"
                >
                  {item.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-full origin-right scale-x-0 bg-brass transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href="#reserva"
          onClick={handleAnchorClick('reserva')}
          className="hidden border border-brass px-5 py-2.5 font-sans text-[0.7rem] font-medium uppercase tracking-[0.18em] text-brass transition-colors duration-300 hover:bg-brass hover:text-ink md:inline-block"
        >
          Sacar turno
        </a>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-movil"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className="-mr-2 ml-auto flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <motion.span
            className="block h-px w-6 bg-bone"
            animate={open ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
          />
          <motion.span
            className="block h-px w-6 bg-bone"
            animate={open ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="menu-movil"
            aria-label="Principal (móvil)"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
            className="overflow-hidden md:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 pb-8 pt-2">
              {nav.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: reduced ? 0 : 0.4,
                    delay: reduced ? 0 : 0.08 + i * 0.05,
                    ease: EASE,
                  }}
                  className="border-b border-line-soft"
                >
                  <a
                    href={`#${item.id}`}
                    onClick={handleAnchorClick(item.id, () => setOpen(false))}
                    className="block py-4 font-display text-3xl text-bone"
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
              <li className="pt-6">
                <a
                  href="#reserva"
                  onClick={handleAnchorClick('reserva', () => setOpen(false))}
                  className="block bg-brass py-4 text-center font-sans text-xs font-medium uppercase tracking-[0.18em] text-ink"
                >
                  Sacar turno
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { business, nav } from '../data/site'
import { handleAnchorClick } from '../lib/scroll'
import { useReducedMotionPolicy } from '../hooks/useMotionPolicy'

const EASE = [0.23, 1, 0.32, 1]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotionPolicy()
  const panelRef = useRef(null)
  const lastFocusedRef = useRef(null)

  // Al pasar a escritorio el panel móvil sobra: si queda abierto, tapa el hero.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = (event) => event.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  /*
    El panel tapa el resto de la página pero no la saca del árbol: sin `inert`,
    Tab seguía llegando a los enlaces de las secciones de abajo, cubiertos pero
    todavía enfocables. El foco entra en el primer enlace del panel al abrir y
    vuelve al botón de menú al cerrar.
  */
  useEffect(() => {
    const targets = [
      document.querySelector('main'),
      document.querySelector('footer'),
      document.getElementById('mobile-bar'),
    ].filter(Boolean)

    if (open) {
      lastFocusedRef.current = document.activeElement
      targets.forEach((el) => {
        el.inert = true
      })
      panelRef.current?.querySelector('a')?.focus()
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

  return (
    <>
      {/*
        Barra maciza, sin translucidez ni desenfoque: no quiere desaparecer, es
        el marco impreso del cartel.

        Sin reglas verticales entre elementos. El espaciado separa los enlaces
        igual de bien y no mete cinco líneas más en los primeros 60px de la
        página. La única línea es la que cierra la barra contra el contenido.
      */}
      <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-chalk bg-void">
        <div className="flex items-center gap-8 px-4 py-4 md:px-6">
          <a
            href="#inicio"
            onClick={handleAnchorClick('inicio', () => setOpen(false))}
            className="font-display text-lg uppercase leading-none tracking-tight text-chalk transition-opacity duration-150 can-hover:hover:opacity-60"
          >
            {business.name}
          </a>

          <nav aria-label="Principal" className="ml-auto hidden md:block">
            <ul className="flex items-center gap-7">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={handleAnchorClick(item.id)}
                    className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-chalk-2 transition-colors duration-150 can-hover:hover:text-chalk"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Plancha de tiza. Sin acento de color, la inversión es lo único que
              distingue la acción principal del resto de los enlaces. */}
          <a
            href="#reserva"
            onClick={handleAnchorClick('reserva')}
            className="hidden border-2 border-chalk bg-chalk px-5 py-2.5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.14em] text-void transition-[background-color,color,transform] duration-150 ease-out-strong can-hover:hover:bg-void can-hover:hover:text-chalk active:translate-y-[2px] md:block"
          >
            Sacar turno
          </a>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="-mr-1 ml-auto flex h-11 w-11 flex-col items-center justify-center gap-1.5 transition-opacity duration-150 active:opacity-50 md:hidden"
          >
            <motion.span
              className="block h-0.5 w-6 bg-chalk"
              animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.25, ease: EASE }}
            />
            <motion.span
              className="block h-0.5 w-6 bg-chalk"
              animate={open ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.25, ease: EASE }}
            />
          </button>
        </div>
      </header>

      {/*
        Panel a pantalla completa en tiza: la inversión total es lo que deja
        claro que estás en otro modo. Entra con opacidad y traslación, nunca
        animando `height`, que dispara layout en cada frame.
      */}
      <AnimatePresence>
        {open && (
          <motion.nav
            ref={panelRef}
            id="menu-movil"
            aria-label="Principal (móvil)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2, ease: EASE }}
            className="fixed inset-0 z-[45] flex flex-col justify-center gap-1 bg-chalk px-4 pt-14 md:hidden"
          >
            {nav.map((item, i) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                onClick={handleAnchorClick(item.id, () => setOpen(false))}
                initial={{ opacity: 0, transform: 'translateY(20px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                exit={{ opacity: 0, transform: 'translateY(20px)' }}
                transition={{
                  duration: reduced ? 0 : 0.3,
                  delay: reduced ? 0 : 0.04 + i * 0.035,
                  ease: EASE,
                }}
                className="py-2 font-display text-5xl uppercase leading-[0.85] tracking-tight text-void transition-opacity duration-150 active:opacity-50"
              >
                {item.label}
              </motion.a>
            ))}

            <motion.a
              href="#reserva"
              onClick={handleAnchorClick('reserva', () => setOpen(false))}
              initial={{ opacity: 0, transform: 'translateY(20px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reduced ? 0 : 0.3,
                delay: reduced ? 0 : 0.04 + nav.length * 0.035,
                ease: EASE,
              }}
              className="mt-10 bg-void py-5 text-center font-mono text-xs font-bold uppercase tracking-[0.14em] text-chalk transition-transform duration-150 ease-out-strong active:translate-y-[2px]"
            >
              Sacar turno
            </motion.a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

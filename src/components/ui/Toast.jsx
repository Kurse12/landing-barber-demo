import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { onDemoToast } from '../../lib/demoToast'
import { useReducedMotionPolicy } from '../../hooks/useMotionPolicy'

const EASE = [0.23, 1, 0.32, 1]
const AUTO_DISMISS = 4200

// Aviso de demo: misma plancha de tiza que usa el mensaje de error y el de
// envío, porque es la única señal de énfasis que existe en el sistema.
export default function Toast() {
  const [message, setMessage] = useState(null)
  const timerRef = useRef(null)
  const reduced = useReducedMotionPolicy()

  useEffect(() => {
    return onDemoToast((text) => {
      window.clearTimeout(timerRef.current)
      setMessage(text)
      timerRef.current = window.setTimeout(() => setMessage(null), AUTO_DISMISS)
    })
  }, [])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:justify-end md:px-6 md:pb-8"
    >
      <AnimatePresence>
        {message && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'translateY(12px)' }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, transform: 'translateY(12px)' }}
            transition={{ duration: 0.2, ease: EASE }}
            className="pointer-events-auto flex max-w-md items-start gap-5 bg-chalk px-5 py-4 text-void"
          >
            <p className="text-sm leading-relaxed">{message}</p>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="flex h-11 min-w-11 shrink-0 items-center justify-center font-mono text-xs font-bold uppercase tracking-[0.14em] text-void/60 transition-colors duration-150 can-hover:hover:text-void"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

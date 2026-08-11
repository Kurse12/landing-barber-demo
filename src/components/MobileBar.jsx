import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ScrollTrigger, useGSAP } from '../lib/gsap'
import { handleAnchorClick } from '../lib/scroll'
import { showDemoToast } from '../lib/demoToast'
import { useReducedMotionPolicy } from '../hooks/useMotionPolicy'

// Mismo aviso de demo que el resto de los controles de contacto. Es un
// <button>, no un <a href="#">: sin `href` real detrás, un clic derecho o el
// clic del medio no tienen destino que seguir saltándose el aviso.
const handleCallClick = () => {
  showDemoToast('Esto es una demo: en un sitio real este enlace abriría el teléfono para llamar.')
}

/**
 * Barra de acción fija, solo en móvil.
 *
 * En escritorio el CTA vive en la barra superior y está siempre a la vista. En
 * un teléfono esa barra se reduce al logo y al botón de menú, así que entre la
 * portada y el formulario el usuario recorre toda la página sin una sola forma
 * de reservar a mano. Esto la pone en la zona del pulgar.
 *
 * Dos bloques, no uno: reservar es la acción principal, pero una barbería de
 * barrio recibe la mitad de los turnos por teléfono, y esconder eso detrás de
 * un formulario es negar cómo trabaja el negocio.
 *
 * Sin acento de color, los dos se distinguen por inversión: la acción principal
 * es la plancha de tiza, la secundaria queda en el fondo de la página.
 */
export default function MobileBar() {
  const [visible, setVisible] = useState(false)
  const reduced = useReducedMotionPolicy()

  useGSAP(() => {
    /*
      Aparece cuando la portada ya salió y se retira al llegar al formulario:
      ahí abajo la acción ya está en pantalla y la barra solo taparía campos.

      Un único ScrollTrigger que abarca el tramo, con `onToggle`: React se
      entera dos veces (al entrar y al salir), no una vez por frame.
    */
    const trigger = ScrollTrigger.create({
      trigger: '#inicio',
      start: 'bottom top+=64',
      endTrigger: '#reserva',
      end: 'top bottom-=140',
      onToggle: (self) => setVisible(self.isActive),
    })
    return () => trigger.kill()
  })

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="mobile-bar"
          initial={reduced ? { opacity: 0 } : { transform: 'translateY(100%)' }}
          animate={reduced ? { opacity: 1 } : { transform: 'translateY(0%)' }}
          exit={reduced ? { opacity: 0 } : { transform: 'translateY(100%)' }}
          transition={
            reduced
              ? { duration: 0.15 }
              : // Sin rebote: la barra no llega lanzada por un gesto del
                // usuario, aparece sola. El rebote es para lo que se tira.
                { type: 'spring', bounce: 0, duration: 0.45 }
          }
          className="fixed inset-x-0 bottom-0 z-40 flex border-t-2 border-chalk bg-void md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <a
            href="#reserva"
            onClick={handleAnchorClick('reserva')}
            className="flex flex-1 items-center justify-center bg-chalk py-5 font-mono text-sm font-bold uppercase tracking-[0.14em] text-void transition-transform duration-150 ease-out-strong active:translate-y-[2px]"
          >
            Sacar turno
          </a>
          <button
            type="button"
            onClick={handleCallClick}
            className="flex items-center justify-center px-8 py-5 font-mono text-sm font-bold uppercase tracking-[0.14em] text-chalk transition-opacity duration-150 active:opacity-50"
          >
            Llamar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

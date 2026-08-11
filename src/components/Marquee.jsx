import { useRef } from 'react'
import { gsap, useGSAP, motionSafe } from '../lib/gsap'
import { marquee } from '../data/site'

// Velocidad de crucero. A menos que esto, la banda parece parada.
const PX_PER_SECOND = 95

// La pista lleva dos mitades idénticas y se desplaza un 50%: al terminar,
// la segunda mitad está justo donde arrancó la primera y el salto no se ve.
// Cada mitad necesita ser más ancha que la pantalla, o al final del ciclo
// se abre un hueco. Con 3 pases de la lista se cubre cualquier monitor real.
const PASSES_PER_HALF = 3

export default function Marquee() {
  const track = useRef(null)

  useGSAP(() => {
    /*
      Movimiento constante y desacoplado del scroll. Antes la banda leía la
      velocidad y la dirección del scroll para acelerar y darse vuelta: se ve
      llamativo en un demo, pero en uso real el usuario percibe que un elemento
      decorativo reacciona a su gesto sin haberlo pedido, y al subir la banda
      invierte la marcha, que es lo que se lee como un fallo.

      Es la única animación en bucle de la página. Ritmo lineal a propósito: el
      movimiento continuo con easing acelera y frena en cada ciclo, y el ojo
      detecta ese latido aunque no sepa nombrarlo.
    */
    const mm = motionSafe(() => {
      const half = track.current.scrollWidth / 2

      const loop = gsap.to(track.current, {
        xPercent: -50,
        duration: half / PX_PER_SECOND,
        ease: 'none',
        repeat: -1,
      })

      return () => loop.kill()
    })

    return () => mm.revert()
  })

  const half = Array.from({ length: PASSES_PER_HALF }, () => marquee).flat()

  return (
    // Plancha de tiza a sangre. Es el único bloque invertido permanente de la
    // página, y funciona porque es una banda fina: da el golpe gráfico sin
    // convertir una pantalla entera en blanco.
    <div
      aria-hidden="true"
      className="select-none overflow-hidden border-y-2 border-chalk bg-chalk py-4"
    >
      <div ref={track} data-marquee-track className="flex w-max items-center">
        {[...half, ...half].map((word, i) => (
          <span key={i} className="flex items-center gap-8 pr-8">
            <span className="whitespace-nowrap font-display text-3xl uppercase tracking-tight text-void md:text-4xl">
              {word}
            </span>
            {/* Cuadrado, no rombo: en este lenguaje nada está rotado. */}
            <span className="h-2.5 w-2.5 shrink-0 bg-void" />
          </span>
        ))}
      </div>
    </div>
  )
}

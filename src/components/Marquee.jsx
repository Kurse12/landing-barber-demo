import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, motionSafe } from '../lib/gsap'
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
    const mm = motionSafe(() => {
      const half = track.current.scrollWidth / 2

      const loop = gsap.to(track.current, {
        xPercent: -50,
        duration: half / PX_PER_SECOND,
        ease: 'none',
        repeat: -1,
      })

      // La banda reacciona al scroll: acelera con la inercia y se orienta
      // hacia donde va el usuario. Al soltar, vuelve a su ritmo.
      const speed = { value: 1 }
      const apply = () => loop.timeScale(speed.value)

      const trigger = ScrollTrigger.create({
        onUpdate: (self) => {
          const direction = self.direction
          const boost = gsap.utils.clamp(1, 5, Math.abs(self.getVelocity()) / 450)

          gsap.killTweensOf(speed)
          speed.value = boost * direction
          apply()

          gsap.to(speed, {
            value: direction,
            duration: 0.9,
            ease: 'power2.out',
            onUpdate: apply,
          })
        },
      })

      return () => {
        gsap.killTweensOf(speed)
        trigger.kill()
      }
    })

    return () => mm.revert()
  })

  const half = Array.from({ length: PASSES_PER_HALF }, () => marquee).flat()

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-b border-line bg-coal py-6 select-none"
    >
      <div ref={track} data-marquee-track className="flex w-max items-center">
        {[...half, ...half].map((word, i) => (
          <span key={i} className="flex items-center gap-10 pr-10">
            <span className="font-display text-2xl whitespace-nowrap text-bone/70 md:text-3xl">
              {word}
            </span>
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-brass" />
          </span>
        ))}
      </div>
    </div>
  )
}

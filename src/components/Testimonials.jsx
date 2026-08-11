import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { testimonials } from '../data/site'
import { useReducedMotionPolicy } from '../hooks/useMotionPolicy'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

function Stars({ rating }) {
  return (
    <p aria-label={`${rating} de 5 estrellas`} className="flex gap-0.5 text-sm">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden="true" className={i < rating ? 'text-chalk' : 'text-chalk-3'}>
          &#9733;
        </span>
      ))}
    </p>
  )
}

export default function Testimonials() {
  const reduced = useReducedMotionPolicy()
  const [[index, direction], setState] = useState([0, 1])
  const item = testimonials[index]

  const go = (step) =>
    setState(([current]) => [
      (current + step + testimonials.length) % testimonials.length,
      step,
    ])

  // Sale por donde entraría el siguiente: el sentido del desplazamiento cuenta
  // hacia dónde se mueve la lista. Sin eso el cambio se lee como un parpadeo.
  const shift = reduced ? 0 : 44 * direction
  const spring = reduced ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.4 }

  return (
    <section id="opiniones" className="bg-void-2">
      <div className="shell pb-16 pt-24 md:pt-32">
        <SectionHeading title="Lo que dicen" meta="Reseñas de Google" className="max-w-4xl" />
      </div>

      {/*
        Una cita grande en lugar de tres tarjetas en fila. Tres testimonios de
        tres líneas no compiten por atención: se leen los tres a medias. Uno a
        cuerpo de cartel se lee entero.
      */}
      <Reveal className="shell overflow-hidden pb-16">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={item.id}
            initial={{ opacity: 0, transform: `translateX(${shift}px)` }}
            animate={{ opacity: 1, transform: 'translateX(0px)' }}
            exit={{ opacity: 0, transform: `translateX(${-shift}px)` }}
            transition={spring}
          >
            <blockquote className="max-w-5xl font-display text-big normal-case text-chalk">
              {item.text}
            </blockquote>

            <figcaption className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <cite className="font-mono text-sm font-bold not-italic uppercase tracking-[0.1em] text-chalk">
                {item.name}
              </cite>
              <span className="label">{item.since}</span>
              <Stars rating={item.rating} />
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </Reveal>

      {/*
        Controles sin marco. La barra activa en tiza plena contra las inactivas
        en gris es toda la señal de estado que hace falta; encerrarlos en celdas
        les daba un peso que no les corresponde.
      */}
      <div className="shell flex items-center justify-between gap-8 pb-24 md:pb-32">
        <div className="flex items-center gap-2">
          {testimonials.map((entry, i) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setState([i, i > index ? 1 : -1])}
              aria-label={`Ver opinión de ${entry.name}`}
              aria-current={i === index}
              className="group py-4"
            >
              <span
                className={`block h-1 w-12 transition-colors duration-150 ${
                  i === index ? 'bg-chalk' : 'bg-chalk-3 group-hover:bg-chalk-2'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Opinión anterior"
            className="flex h-12 w-12 items-center justify-center border-2 border-chalk-3 text-lg text-chalk transition-[background-color,border-color,color,transform] duration-150 ease-out-strong hover:border-chalk hover:bg-chalk hover:text-void active:translate-y-[2px]"
          >
            <span aria-hidden="true">&larr;</span>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Opinión siguiente"
            className="flex h-12 w-12 items-center justify-center border-2 border-chalk-3 text-lg text-chalk transition-[background-color,border-color,color,transform] duration-150 ease-out-strong hover:border-chalk hover:bg-chalk hover:text-void active:translate-y-[2px]"
          >
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </section>
  )
}

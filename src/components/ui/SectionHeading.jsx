import Reveal from './Reveal'

/**
 * Cabecera de sección. La regla de 2px que la abre es la única línea gruesa que
 * queda en la página: marca dónde empieza un bloque y nada más. Dentro de la
 * sección no hay celdas ni columnas dibujadas, así que esta regla es lo que
 * sostiene el ritmo de toda la lectura.
 *
 * Sin eyebrow y sin número: lo que separa una sección de la siguiente es esa
 * regla y el salto de cuerpo tipográfico. Una etiqueta encima repetiría con
 * texto lo que ya dice la estructura.
 */
export default function SectionHeading({ title, subtitle, meta, className = '' }) {
  return (
    <header className={className}>
      <Reveal className="section-rule pt-6">
        <div className="flex items-baseline justify-between gap-8">
          <h2 className="text-mega text-chalk">{title}</h2>
          {meta && <span className="label hidden shrink-0 sm:block">{meta}</span>}
        </div>
      </Reveal>

      {subtitle && (
        <Reveal as="p" delay={0.08} className="mt-8 max-w-xl leading-relaxed text-chalk-2">
          {subtitle}
        </Reveal>
      )}
    </header>
  )
}

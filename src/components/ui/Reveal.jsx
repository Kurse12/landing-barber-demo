import { motion } from 'motion/react'
import { useReducedMotionPolicy } from '../../hooks/useMotionPolicy'

/**
 * Aparición al entrar en viewport. Para bloques sueltos de texto o media.
 * Lo pesado (timelines, scrub, parallax) va con GSAP; esto es el caso simple.
 *
 * Se anima `transform` como cadena y no el atajo `y`: los atajos de Motion
 * (`x`, `y`, `scale`) pasan por requestAnimationFrame en el hilo principal y
 * pierden frames cuando el navegador está cargando imágenes. La cadena
 * completa sí la compone la GPU.
 */
export default function Reveal({
  as = 'div',
  delay = 0,
  y = 24,
  blur = false,
  className = '',
  children,
  ...rest
}) {
  const reduced = useReducedMotionPolicy()
  const Tag = motion[as] ?? motion.div

  if (reduced) {
    const Plain = as
    return (
      <Plain className={className} {...rest}>
        {children}
      </Plain>
    )
  }

  return (
    <Tag
      className={className}
      initial={{
        opacity: 0,
        transform: `translateY(${y}px)`,
        ...(blur && { filter: 'blur(6px)' }),
      }}
      whileInView={{
        opacity: 1,
        transform: 'translateY(0px)',
        ...(blur && { filter: 'blur(0px)' }),
      }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

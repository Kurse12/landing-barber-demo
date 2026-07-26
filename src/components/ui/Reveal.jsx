import { motion } from 'motion/react'
import { useReducedMotionPolicy } from '../../hooks/useMotionPolicy'

/**
 * Aparición al entrar en viewport. Para bloques sueltos de texto o media.
 * Lo pesado (timelines, scrub, parallax) va con GSAP; esto es el caso simple.
 */
export default function Reveal({
  as = 'div',
  delay = 0,
  y = 24,
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
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

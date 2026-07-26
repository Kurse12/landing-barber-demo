import { useReducedMotion } from 'motion/react'
import { RESPECT_REDUCED_MOTION } from '../lib/motionPolicy'

/**
 * Versión de `useReducedMotion` de Motion que pasa por nuestra política.
 * Devuelve siempre `false` mientras animemos para todo el mundo.
 */
export function useReducedMotionPolicy() {
  const systemPrefersReduced = useReducedMotion()
  return RESPECT_REDUCED_MOTION ? systemPrefersReduced : false
}

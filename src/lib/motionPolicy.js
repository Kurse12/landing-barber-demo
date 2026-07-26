/**
 * Interruptor único de la política de movimiento.
 *
 * `false` → animamos para todo el mundo, ignorando `prefers-reduced-motion`.
 * `true`  → respetamos la preferencia del sistema y no animamos nada.
 *
 * Decisión de producto tomada a conciencia: se prioriza que la landing se vea
 * igual para todos. Contrapartida real: la WCAG 2.3.3 y 2.2.2 esperan que el
 * movimiento no esencial se pueda desactivar, y el parallax y el scroll suave
 * pueden marear a personas con trastornos vestibulares. Poner esto a `true`
 * devuelve el comportamiento accesible sin tocar ningún componente.
 */
export const RESPECT_REDUCED_MOTION = false

/** Consulta puntual, fuera de React. */
export function prefersReducedMotion() {
  if (!RESPECT_REDUCED_MOTION) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Media query para `gsap.matchMedia`: 'all' casa siempre. */
export const MOTION_QUERY = RESPECT_REDUCED_MOTION
  ? '(prefers-reduced-motion: no-preference)'
  : 'all'

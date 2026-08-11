import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { MOTION_QUERY } from './motionPolicy'

/*
  Registro único para toda la app. Importa desde aquí, nunca desde 'gsap' directo.

  SplitText ya no está: hacía falta cuando el navegador decidía dónde partir el
  titular de portada y había que medir las líneas después de cargar la fuente.
  Ahora las líneas vienen declaradas en los datos, así que no hay nada que medir.
  De paso desaparece el conflicto con React en desarrollo: SplitText envuelve el
  texto en nodos propios y el reconciliador intentaba quitar hijos que no había
  creado él.
*/
gsap.registerPlugin(ScrollTrigger, useGSAP)

export { gsap, ScrollTrigger, useGSAP }

// Envuelve las animaciones sujetas a la política de movimiento (ver
// lib/motionPolicy.js). Se usa matchMedia para que el cleanup de useGSAP
// revierta los tweens igual, y volver a ignorar la preferencia sea cambiar
// una sola constante.
export function motionSafe(callback) {
  const mm = gsap.matchMedia()
  mm.add(MOTION_QUERY, callback)
  return mm
}

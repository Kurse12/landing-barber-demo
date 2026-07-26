import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { MOTION_QUERY } from './motionPolicy'

// Registro único para toda la app. Importa desde aquí, nunca desde 'gsap' directo.
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

export { gsap, ScrollTrigger, SplitText, useGSAP }

// Envuelve las animaciones sujetas a la política de movimiento (ver
// lib/motionPolicy.js). Se sigue usando matchMedia aunque ahora la consulta
// case siempre: así el cleanup de useGSAP revierte los tweens igual, y volver
// a respetar la preferencia es cambiar una constante.
export function motionSafe(callback) {
  const mm = gsap.matchMedia()
  mm.add(MOTION_QUERY, callback)
  return mm
}

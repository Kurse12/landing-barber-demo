/*
  Punto único de salida del turnero. Hoy es una demo: espera un momento y
  resuelve sin mandar nada a ningún lado. Cuando esté la API, la llamada va
  acá y el componente no cambia: arma el mismo objeto y espera la misma
  promesa. Si la promesa se rechaza, el turnero muestra un aviso y deja
  reintentar sin perder lo que el usuario completó.

  Forma del turno que recibe:
  {
    service:  'corte-barba',        // id en data/site.js
    barber:   'marco',              // id del barbero que atiende (ya resuelto
                                    // si eligió "el que esté libre")
    anyBarber: true,                // si lo eligió así
    date:     '2026-09-18',         // fecha local, YYYY-MM-DD
    time:     '11:00',
    duration: 50,                   // minutos
    price:    18000,                // pesos
    name, email, phone, notes,
  }
*/
export async function submitBooking(booking) {
  // Con la API real, algo así:
  //
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/turnos`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(booking),
  // })
  // if (!res.ok) throw new Error(`No se pudo reservar (HTTP ${res.status})`)
  // return res.json()

  void booking
  await new Promise((resolve) => window.setTimeout(resolve, 900))
  return { ok: true }
}

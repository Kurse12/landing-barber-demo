# Sistema de diseño: cartel monocromo

Fuente de verdad del lenguaje visual. Cualquier sección nueva se genera contra
este documento.

**Diales:** Variancia 8 · Movimiento 7 · Densidad 4.

---

## 1. Atmósfera

**Cartel monocromo.** Negro, tiza y los grises que salen de mezclarlos. Nada más.

Dos decisiones sostienen todo el sistema:

1. **No hay acento de color.** Lo que destaca un elemento es la **inversión del
   bloque**: una plancha de tiza con el tipo calado en negro. Es la única marca
   de énfasis que existe, y por eso, donde aparece, es total.
2. **Las reglas solo abren secciones.** Dentro de una sección no hay celdas, ni
   columnas, ni filas dibujadas. Separa el espacio.

La consecuencia es que la jerarquía tiene que llevarla el cuerpo tipográfico, la
alineación y el aire. No queda ningún atajo: ni un color que grite, ni un marco
que agrupe por uno.

---

## 2. Color

| Nombre | Hex | Rol |
| --- | --- | --- |
| Void | `#0c0c0b` | Fondo de página |
| Void 2 | `#131312` | Banda alterna, apenas perceptible |
| Chalk | `#ece8e0` | Texto principal, reglas de sección, planchas invertidas |
| Chalk 2 | `#918c82` | Texto secundario y etiquetas |
| Chalk 3 | `#6a655b` | Trazo mínimo: bordes de campo, controles inactivos |

**Contraste verificado:**

| Combinación | Ratio | Mínimo |
| --- | --- | --- |
| Chalk sobre void | 16,02 | 4,5 |
| Chalk sobre void 2 | 15,21 | 4,5 |
| Chalk 2 sobre void | 5,85 | 4,5 |
| Chalk 2 sobre void 2 | 5,56 | 4,5 |
| Void sobre chalk | 16,02 | 4,5 |
| Chalk 3 sobre void | 3,38 | 3,0 |
| Chalk 3 sobre void 2 | 3,21 | 3,0 |

**Chalk 3 no baja de ahí.** WCAG 1.4.11 pide 3:1 para el contorno de un control,
y un borde de campo que no se percibe es un campo que no se ve.

Los grises son **cálidos**, de la misma familia que la tiza. Un gris neutro al
lado de un blanco cálido se lee azulado.

**Bloques invertidos permanentes:** el marquee y la lámina de Instagram. El menú
móvil, la fila en hover, el mensaje de error y el aviso de envío son pasajeros.
El pie **no** se invierte: una franja de tiza a página completa al final compite
con todo lo de arriba.

---

## 3. Tipografía

| Rol | Familia | Uso |
| --- | --- | --- |
| Display | `Archivo Black` | Titulares, nombres, cifras, wordmark |
| Texto | `Archivo` 400 / 500 / 600 | Párrafos y descripciones |
| Mono | `Space Mono` 400 / 700 | **Todo dato**: precios, duraciones, horarios, etiquetas, navegación |

**La mono hace trabajo estructural, no decorativo.** Sin retícula dibujada, lo
único que mantiene legible una lista de seis precios es que el índice, la
duración y el importe vayan en mono tabular: forman columnas reales aunque no
haya ninguna línea marcándolas. Con ancho proporcional, la lista se desarma.

**Escala.** El titular de portada se sirve línea por línea, y **el cuerpo de cada
línea se mide, no se estima** (`usePosterFit`). Se pone la línea a un cuerpo de
referencia, se lee el ancho real que ocupa y se escala por regla de tres, de modo
que llene el ancho disponible exacto.

Calcular un `vw` por línea contando caracteres no funciona: el avance real
depende de qué letras son, así que una línea de C, O y S es mucho más ancha que
una de I, T y L con el mismo número de letras. El mismo `vw` que entra justo en
una línea recorta la siguiente.

| Token | Tamaño | Interlínea | Interletrado |
| --- | --- | --- | --- |
| `text-poster` | `clamp(2.5rem, 16vw, 12rem)` **(reserva)** | `0.8` | `-0.045em` |
| `text-mega` | `clamp(2.5rem, 10vw, 8rem)` | `0.84` | `-0.035em` |
| `text-big` | `clamp(1.9rem, 5.5vw, 4.25rem)` | `0.9` | `-0.025em` |

El valor de `text-poster` es deliberadamente corto: es lo que se ve durante el
instante anterior a la medida, y lo definitivo si el JS no corriera. Conviene que
quede corto y no que recorte una letra contra el margen.

**La medida espera a la fuente.** Archivo Black tarda en llegar y, mientras, el
navegador mide con la de reserva, que tiene otro avance: el titular quedaría
cuadrado al ancho equivocado. `ResizeObserver` la repite al girar el teléfono.

**El elemento medido no lleva padding.** `clientWidth` lo incluye, así que medir
un elemento con margen lateral daría un ancho mayor del que cabe. El margen vive
en el contenedor de afuera.

`h1`, `h2` y `h3` van en caja alta. El interletrado es específico de cada cuerpo:
un valor único está mal en algún tamaño siempre.

**Prohibido:** `Inter`, `Instrument Serif`, `Fraunces`, cualquier serif, y los
degradados sobre texto.

---

## 4. Forma y materia

- **Radio 0 en todo.** Sin excepciones.
- **Sin sombras y sin elevación.** Nada flota.
- **Sin cristal ni desenfoque de fondo.** La barra de navegación es maciza.
- **Reglas.** Solo tres tipos: la de sección (2px tiza, abre un bloque), la de
  la barra de navegación (la cierra contra el contenido), y el marco del
  marquee. Ninguna otra línea gruesa. Los bordes de campo y de botón fantasma
  son de control, no de retícula, y van en chalk 3.
- **Fotografía en gris con `contrast-125`.** El hover no puede virar a color, así
  que lo que cambia es el rango: la foto se aclara y se despega del fondo.
- **Grano** al 5% con mezcla normal, en un elemento fijo y sin eventos. En
  negativo `multiply` no haría nada.

---

## 5. Composición

Una familia de layout por sección.

| Sección | Familia |
| --- | --- |
| Portada | Póster: dos columnas, tres líneas apiladas a la izquierda y foto a sangre a la derecha, pie de datos |
| La carta | Lista numerada alineada en mono, inversión total en hover |
| La casa | Bloques + banda de imagen a sangre + cifras a cuerpo de cartel |
| Las manos | Tres retratos con parallax de distinta profundidad |
| El trabajo | Tira horizontal anclada al scroll, láminas con pie |
| Opiniones | Cita a cuerpo de cartel con controles al pie |
| Turnos | Formulario y columna de datos |
| Cierre | Titular masivo + plancha de tiza + wordmark recortado por el margen |

**Sin eyebrows, sin numerar secciones, sin pistas de scroll.** Lo que separa una
sección de la siguiente es la regla que la abre y el salto de cuerpo. La
numeración `01..06` de la carta no es una etiqueta de sección: es el índice de
una lista de precios, que es como se numeran las listas de precios.

---

## 6. Móvil

El móvil **no es la versión recortada del escritorio**. Dos piezas existen solo
ahí, y una existe solo en escritorio.

- **Barra de acción fija** (`MobileBar`). En escritorio el CTA vive en la barra
  superior y está siempre a la vista; en un teléfono esa barra se reduce al logo
  y al botón de menú, así que entre la portada y el formulario el usuario recorre
  toda la página sin una forma de reservar a mano. Aparece al salir la portada y
  se retira al llegar al formulario, donde solo taparía campos.
  **Dos bloques, no uno**: una barbería de barrio recibe la mitad de los turnos
  por teléfono, y esconder eso detrás de un formulario es negar cómo trabaja el
  negocio. Se distinguen por inversión: reservar es la plancha de tiza, llamar
  queda en el fondo. Respeta `env(safe-area-inset-bottom)`.
- **Foto en la fila de la carta.** En escritorio la foto del servicio sigue al
  puntero; en el teléfono no hay puntero, así que va dentro de la fila.
  Equivalente para un dedo, no versión degradada.
- **Tira de galería con scroll nativo.** El pin con scroll horizontal es solo de
  escritorio: en un teléfono el gesto nativo, con su inercia y su snap, es mejor
  que cualquier hijack.

**Reglas generales.** Todo colapsa a una columna bajo 768px. Las columnas de la
carta bajan bajo el nombre del servicio. Alturas completas con `min-h-[100dvh]`,
nunca `h-screen`. Objetivos táctiles de 44px. Cero scroll horizontal accidental.

---

## 7. Movimiento

Cada animación se justifica en una frase: jerarquía, relato, respuesta o cambio
de estado.

```
--ease-out-strong:    cubic-bezier(0.23, 1, 0.32, 1)
--ease-in-out-strong: cubic-bezier(0.77, 0, 0.175, 1)
--ease-drawer:        cubic-bezier(0.32, 0.72, 0, 1)
```

| Elemento | Duración |
| --- | --- |
| Respuesta a la pulsación | 150ms |
| Hover, foco, inversión de fila | 150ms |
| Entrada de panel o modal | 180-220ms |
| Barra móvil | Muelle sin rebote, 450ms |
| Revelado al entrar en viewport | 700-1200ms |
| Parallax y scrub | Atados al scroll |

Las conmutaciones son **más rápidas** que en un lenguaje suave: el hover de fila
invierte de golpe, no se funde. Un cartel no tiene estados intermedios.

**Reglas duras.**

- Solo `transform` y `opacity`. Nunca `width`, `height`, `top`, `left`,
  `flex-grow`.
- El `:active` **hunde 2px** (`translate-y`), no escala. Escalar es el gesto de
  una superficie de cristal; hundir es el de algo impreso.
- Nada entra desde `scale(0)`.
- Rebote solo si el gesto del usuario traía inercia. La barra móvil aparece
  sola, así que va sin rebote.
- Prohibido `window.addEventListener('scroll')`. ScrollTrigger con `onToggle`
  para estados booleanos: React se entera al cruzar el umbral, no por frame.
- Posiciones continuas (cursor, arrastre) en motion values, jamás en `useState`.
- Un solo marquee, a velocidad constante y **desacoplado del scroll**.
- Hovers tras `@media (hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion` se respeta: se quitan traslación, parallax y grano.

---

## 8. Componentes

- **Bloque de acción.** El primario es una plancha de tiza con el tipo calado; al
  pasar por encima se da vuelta. Su regla solo se ve cuando el fondo desaparece,
  así que en reposo no suma ninguna línea. `translate-y-[2px]` al apretar.
- **Campo.** Etiqueta mono arriba, mensaje debajo, nunca placeholder como
  etiqueta. Borde en chalk 3 en reposo, tiza plena en foco y en error: contra el
  gris de los demás campos, el roto salta a la vista sin color dedicado.
- **Error.** Sin color de alerta, se marca por inversión: el mensaje va en una
  plancha de tiza con el tipo calado. Misma señal que la acción principal, y por
  eso se reconoce.
- **Validación.** En línea: el error desaparece al corregir. Al enviar con
  errores, el foco salta al primer campo roto.
- **Lightbox.** Fondo de void macizo. Las fotos son gris de alto contraste: sobre
  fondo claro los negros se aplanan.

---

## 9. Prohibiciones

Sin emojis. Sin color de acento. Sin `Inter` ni serif. Sin `#000000` ni
`#ffffff`. Sin radios, sombras ni resplandores. Sin cristal ni desenfoque de
fondo. Sin degradados. Sin nada rotado, salvo la transformación funcional del
ícono de menú a X al abrirse: no es un giro decorativo, es la única forma
convencional de esa afordancia. Sin reglas entre filas ni entre columnas.
Sin capturas de producto falsas hechas con `div`. Sin SVG decorativos dibujados a
mano. Sin etiquetas superpuestas sobre las fotos. Sin pies de foto pretenciosos.
Sin pistas de scroll. Sin tiras de ciudad, hora o clima. Sin sellos de versión.
Sin nombres genéricos ni cifras falsamente precisas. Sin muletillas de marketing.

**Y sin raya larga.** Ni `—` ni `–` en ningún texto visible. El único guion
permitido es el corto `-`.

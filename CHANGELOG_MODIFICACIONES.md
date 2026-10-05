# Modificaciones realizadas

## Física y modelo
- Modelo Butler centralizado mediante `b = B a`; la matriz ideal se construye a partir de los cuatro estados de fase.
- Se distingue el ángulo analítico del factor de arreglo `θAF` del máximo numérico del patrón total `θTotal`.
- Se eliminó el fallback incorrecto que mostraba un ángulo nominal cuando `|sin θ| > 1`.
- Detección analítica de grating lobes mediante `kd sinθ + β = 2πm`.
- Conversión dB → amplitud para incorporar datos de VNA.
- Pruebas de física para λ, ±45°, ±135°, q=0, q=1, grating lobes y conversión dB.

## Recurso pedagógico
- Paso 1 ahora activa una sola antena `[1,0,0,0]`.
- Paso 2 usa cuatro antenas en fase `[1,1,1,1]`.
- Paso 3 introduce una progresión de fase real.
- Estado efectivo unificado para amplitudes, fases, β, espaciado y patrón.
- Explicación DFT corregida: no se afirma que la Butler sea una FFT digital.

## Topología
- `ButlerDiagramSVG.tsx` se rehízo con 4 híbridos, 2 desfasadores y 2 crossovers.
- Los bloques son seleccionables mediante clic/tap/teclado.
- Se eliminan valores de desempeño arbitrarios presentados como propiedades universales.

## Parámetros avanzados
- Dos modos de espaciado: `d/λ` fijo y distancia física fija en mm.
- Modelo no ideal con errores de amplitud y fase editables por salida.
- Advertencias de grating lobes basadas en las soluciones matemáticas reales.

## Medición
- Nueva sección para introducir magnitud [dB] y fase [°] medidas en O1–O4.
- Importación CSV local y conversión automática a amplitud lineal.
- Los datos medidos pueden alimentar directamente el cálculo del patrón.

## Proyecto
- Eliminadas dependencias de IA/backend no utilizadas.
- Eliminada la necesidad de `GEMINI_API_KEY`.
- README actualizado para ejecución local normal.

## 2026-10-05 — Navegación por pestañas y responsive

- Reorganización de la aplicación en seis pestañas funcionales: Butler, Patrón, Paso a paso, Bloques, Explorar y Medición.
- El contenido ya no se apila completo en una sola página; cada pestaña renderiza únicamente el contenido asociado.
- Nueva pestaña específica de Patrón para separar visualmente la red Butler de la radiación del arreglo.
- Barra de pestañas horizontal desplazable en pantallas pequeñas y centrada en escritorio.
- Diseño adaptativo con grids que cambian entre una y dos columnas según el ancho disponible.
- En escritorio, la aplicación ocupa la altura del navegador y el área de cada pestaña administra su propio desplazamiento si fuera necesario.
- Los SVG principales ahora escalan al ancho disponible, eliminando anchos mínimos que obligaban a desplazamiento horizontal.
- DataPanel reorganizado para envolver la cadena conceptual sin ancho mínimo fijo.
- Ajustes de padding y tipografía para móvil, tablet y escritorio.
- Se mantiene un ancho mínimo de 320 px y se evita overflow horizontal global.

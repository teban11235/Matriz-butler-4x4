# Matriz Butler 4×4 y arreglo de antenas

Recurso educativo interactivo en React + TypeScript para estudiar una matriz Butler 4×4, la distribución de amplitud/fase en sus salidas y su efecto sobre el patrón de un arreglo lineal de cuatro antenas.

## Demo en GitHub Pages

Cuando GitHub Pages esté habilitado con **Source: GitHub Actions**, la aplicación se publicará en:

`https://teban11235.github.io/Matriz-butler-4x4/`

## Ejecutar localmente

Requisitos: Node.js y npm.

```bash
npm install
npm run dev
```

## Verificación

```bash
npm run lint
npm run test:physics
npm run build
```

No requiere backend, claves de API ni servicios externos.

## Funciones principales

- Interfaz responsive organizada mediante pestañas.
- Topología Butler 4×4: 4 híbridos de 90°, 2 desfasadores de 45° y 2 crossovers.
- Ruta pedagógica desde una antena individual hasta beam steering.
- Diferenciación entre patrón del elemento, array factor y patrón total.
- Cálculo dinámico de θAF y del máximo numérico del patrón total.
- Modos de separación normalizada d/λ y separación física fija.
- Detección analítica de grating lobes.
- Modelo no ideal con errores editables de amplitud y fase.
- Entrada manual o CSV de mediciones VNA (magnitud y fase O1–O4).

## Despliegue

El workflow `.github/workflows/deploy-pages.yml` ejecuta pruebas, comprobación de tipos y build antes de publicar `dist/` en GitHub Pages.

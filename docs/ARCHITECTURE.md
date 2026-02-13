# Arquitectura y Flujo

## Objetivo
El sitio tiene dos experiencias:
1. Home (`/`): relato con scroll sobre el mapa real de Tigre, con texto superpuesto.
2. Detalle (`/tigre/`): vista editorial con interaccion sobre calles de mujeres.

## Carga de datos

### Home
- Archivo: `src/routes/+page.ts`
- Carga:
  - `municipios/resumen.json`
  - `municipios/tigre.calles.json`
- El GeoJSON de Tigre se carga en cliente en `src/routes/+page.svelte` (`ensureTigreGeojson`).

### Tigre detalle
- Archivo: `src/routes/tigre/+page.ts`
- Carga:
  - `${base}/municipios/tigre.calles.json`
  - `${base}/tigre.geojson`
- Importante: se usa `base` para compatibilidad en deploy con subruta.

## Cruce GeoJSON + dataset
- Archivo: `src/lib/story/model.ts`
- Funcion: `annotateGeojson(geojson, calles, "tigre")`
- Resultado por feature:
  - `genero`
  - `matched`
  - `categoria`
  - `matchedName`

## Render y performance

### Home (`src/routes/+page.svelte`)
- `IntersectionObserver` cambia `activeStep`.
- Se renderizan dos capas SVG:
  - `storyBasePaths`: red base
  - `storyHighlightPaths`: subset segun paso
- El texto se posiciona en overlay absoluto sobre el mapa.

### Tigre (`src/routes/tigre/+page.svelte`)
- `basePaths` para contexto visual.
- `womenPaths` para interaccion (hover/click).
- En pantallas chicas se activa `compactMap` para reducir paths renderizados:
  - base: 1 de cada 3
  - women: 1 de cada 2

## Interaccion
- Hover en calle femenina: muestra tooltip con nombre y categoria.
- Click en calle femenina: abre panel de detalle.

## Estilos
- Paleta oscura roja consistente entre home y detalle.
- Tipografia display para relato en scroll y tipografia legible para metadatos.

## Comandos utiles
```powershell
deno task dev
deno task check
deno task build
```

## Riesgos y mejoras sugeridas
1. `tigre.geojson` es grande (~11.9k segmentos); si sube el costo en equipos lentos, mover base a `canvas`.
2. Simplificar geometria (preproceso) para reducir nodos SVG.
3. Resolver warnings de a11y de elementos `<path>` interactivos.

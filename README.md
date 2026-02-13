# Calles Zona Norte

Proyecto SvelteKit + Deno para visualizar nombres de calles en municipios de Zona Norte.

## Requisitos
- Deno instalado y disponible en PATH.

## Desarrollo
```powershell
deno task dev
```
Abrir `http://localhost:5173`.

## Checks
```powershell
deno task check
```

## Build
```powershell
deno task build
```

## Estructura de datos
- `static/municipios/resumen.json`: resumen por municipio.
- `static/municipios/tigre.calles.json`: dataset de calles para cruces de Tigre.
- `static/tigre.geojson`: geometria base de Tigre.

## Paginas
- `/`: scrollytelling sobre mapa de Tigre + indice de municipios (solo Tigre activo).
- `/tigre/`: detalle editorial del mapa de Tigre con calles de mujeres interactivas.

## Documentacion tecnica
Ver `docs/ARCHITECTURE.md`.

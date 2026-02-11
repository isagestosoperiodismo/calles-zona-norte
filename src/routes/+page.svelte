<script lang="ts">
  import { geoPath, geoMercator } from "d3-geo";
  import { colorPorGenero } from "$lib/map/color.js";
  import Select from "../components/Select.svelte";
  import type { FeatureCollection } from "geojson";
  import { base } from "$app/paths";

  let { data } = $props();

  let municipioSeleccionado = $state("Tigre");
  let geojsonCargado = $state<FeatureCollection | null>(null);
  let cargando = $state(false);
  // --- DEBUG DE CARGA ---
  $effect(() => {
    async function cargarGeojson() {
      cargando = true;

      // Normalizamos el nombre del archivo
      const nombreArchivo = municipioSeleccionado
        .toLowerCase()
        .replace(/\s+/g, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      // CONSTRUCCIÓN DE LA RUTA:
      // Usamos base y nos aseguramos de que no haya doble barra
      const rutaFetch = `${base}/${nombreArchivo}.geojson`.replace(/\/+/g, "/");

      console.log("Ruta final generada:", rutaFetch);

      try {
        const res = await fetch(rutaFetch);
        if (res.ok) {
          geojsonCargado = await res.json();
          console.log("✅ Datos cargados correctamente");
        } else {
          console.error("❌ Error 404 en la ruta:", rutaFetch);
          geojsonCargado = null;
        }
      } catch (e) {
        console.error("❌ Falló el fetch:", e);
      } finally {
        cargando = false;
      }
    }
    cargarGeojson();
  });
  // Mantenemos estas dimensiones internas para D3
  const width = 1000;
  const height = 800;

  $effect(() => {
    async function cargarGeojson() {
      cargando = true;
      const nombreArchivo = municipioSeleccionado
        .toLowerCase()
        .replace(/\s+/g, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      try {
        const res = await fetch(`/${nombreArchivo}.geojson`);
        if (res.ok) {
          geojsonCargado = await res.json();
        } else {
          geojsonCargado = null;
        }
      } catch (e) {
        console.error(e);
      } finally {
        cargando = false;
      }
    }
    cargarGeojson();
  });

  let geojsonMunicipio = $derived.by(() => {
    if (!geojsonCargado || !data.calles) return null;
    const callesDB = data.calles
      .filter((c: any) => c.municipio === municipioSeleccionado)
      .map((c: any) => ({
        ...c,
        nombreNorm: (c.nombre || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\b(avenida|av|calle|pje|dr|dra|grl)\b/g, "")
          .trim(),
      }));

    return {
      ...geojsonCargado,
      features: geojsonCargado.features.map((f: any) => {
        const nombreGeo = (f.properties?.name || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();
        const match = callesDB.find(
          (c) =>
            nombreGeo &&
            (nombreGeo.includes(c.nombreNorm) ||
              c.nombreNorm.includes(nombreGeo)),
        );
        return {
          ...f,
          properties: {
            ...f.properties,
            genero: match ? match.genero : "otro",
          },
        };
      }),
    };
  });

  let projection = $derived.by(() => {
    if (!geojsonMunicipio) return null;
    const featuresConNombre = geojsonMunicipio.features.filter(
      (f: any) => f.properties?.name && f.properties.name.trim() !== "",
    );
    // Agregamos más aire (padding) para que no se pegue a los bordes en el celu
    return geoMercator().fitSize(
      [width - 80, height - 80],
      featuresConNombre.length > 0
        ? { ...geojsonMunicipio, features: featuresConNombre }
        : geojsonMunicipio,
    );
  });

  let pathGenerator = $derived(
    projection ? geoPath().projection(projection) : null,
  );
</script>

<div class="page-layout">
  <header class="selector-container">
    <Select
      label="Municipio"
      id="municipio-select"
      options={data.municipios}
      bind:value={municipioSeleccionado}
    />
    {#if cargando}
      <div class="loading-line"></div>
    {/if}
  </header>

  <main class="map-view">
    {#if pathGenerator && geojsonMunicipio}
      <svg viewBox="0 0 {width} {height}" class="responsive-svg">
        <g class="base-layer">
          {#each geojsonMunicipio.features.filter((f) => f.properties?.genero === "otro") as feature}
            <path d={pathGenerator(feature)} class="base-path" />
          {/each}
        </g>
        <g class="highlight-layer">
          {#each geojsonMunicipio.features.filter((f) => f.properties?.genero !== "otro") as feature}
            <path
              d={pathGenerator(feature)}
              class="gender-path"
              stroke={colorPorGenero(feature.properties?.genero)}
            />
          {/each}
        </g>
      </svg>
    {/if}
  </main>

  <footer class="legend-footer">
    <div class="legend-grid">
      <div class="item"><span class="bar f"></span> Femenino</div>
      <div class="item"><span class="bar m"></span> Masculino</div>
      <div class="item"><span class="bar o"></span> Otro</div>
    </div>
  </footer>
</div>

<style>
  /* Sin bloqueos de overflow: scroll natural */
  :global(body) {
    margin: 0;
    padding: 0;
    background: #fff;
    font-family: sans-serif;
  }

  .page-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 5px;
    box-sizing: border-box;
    gap: 20px;
  }

  .selector-container {
    width: 100%;
  }

  .map-view {
    width: 100%;
    background: white;
    border-radius: 8px;
  }

  .responsive-svg {
    width: 100%;
    height: auto;
    display: block;
  }

  .base-path {
    fill: none;
    stroke: #cad2d9;
    stroke-width: 0.8;
  }
  .gender-path {
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .legend-footer {
    padding: 20px 0;
    border-top: 1px solid #eee;
  }

  .legend-grid {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
  }
  .bar {
    width: 30px;
    height: 5px;
    border-radius: 2px;
  }
  .bar.f {
    background: #fc68c3;
  }
  .bar.m {
    background: #5672fb;
  }
  .bar.o {
    background: #eee;
  }

  .loading-line {
    height: 2px;
    background: #ff00ff;
    width: 100%;
    margin-top: 8px;
    animation: pulse 1s infinite alternate;
  }
  @keyframes pulse {
    from {
      opacity: 0.3;
    }
    to {
      opacity: 1;
    }
  }
</style>

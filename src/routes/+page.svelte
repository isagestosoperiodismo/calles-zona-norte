<script lang="ts">
  import { onMount, tick } from "svelte";
  import { geoPath, geoMercator } from "d3-geo";
  import { base } from "$app/paths";
  import LoaderOverlay from "../components/story/LoaderOverlay.svelte";
  import StoryHeader from "../components/story/StoryHeader.svelte";
  import {
    annotateGeojson,
    getCounterForStep,
    getStoryStats,
    getVisibleHighlight,
    storySteps,
  } from "$lib/story/model";

  let { data } = $props();

  const width = 1300;
  const height = 1100;

  let geojsonCargado = $state<any>(null);
  let cargando = $state(false);
  let cargaInicialCompleta = $state(false);
  let inicioStory = $state(false);
  let activeStep = $state(0);

  let stepNodes: HTMLElement[] = [];

  $effect(() => {
    async function cargarGeojson() {
      cargando = true;
      try {
        const res = await fetch(`${base}/tigre.geojson`);
        geojsonCargado = res.ok ? await res.json() : null;
      } catch (e) {
        console.error(e);
        geojsonCargado = null;
      } finally {
        cargando = false;
        cargaInicialCompleta = true;
      }
    }
    cargarGeojson();
  });

  let geojsonMunicipio = $derived.by(() => annotateGeojson(geojsonCargado, data.calles, "tigre"));

  let projection = $derived.by(() => {
    if (!geojsonMunicipio) return null;
    const featuresConNombre = geojsonMunicipio.features.filter(
      (f: any) => f.properties?.name && f.properties.name.trim() !== "",
    );
    return geoMercator().fitSize(
      [width - 18, height - 18],
      featuresConNombre.length > 0
        ? ({ ...geojsonMunicipio, features: featuresConNombre } as any)
        : (geojsonMunicipio as any),
    );
  });

  let pathGenerator = $derived(projection ? geoPath().projection(projection) : null);
  let mostrarLoader = $derived(
    !cargaInicialCompleta || cargando || !geojsonMunicipio || !pathGenerator,
  );

  let features = $derived(geojsonMunicipio?.features ?? []);
  let stats = $derived(getStoryStats(features));
  let counter = $derived(getCounterForStep(stats, activeStep));
  let visiblesHighlight = $derived(getVisibleHighlight(features, activeStep));

  function strokeBase() {
    if (activeStep >= 4) return "#5e2a34";
    return "#6b313d";
  }
  function strokeWidthBase() {
    if (activeStep === 0) return 1.15;
    if (activeStep >= 4) return 0.75;
    return 1.25;
  }
  function strokeWidthHighlight() {
    if (activeStep < 3) return 1.8;
    return 2.6;
  }
  function strokeColorHighlight() {
    return "#2f6bff";
  }

  function setStepRef(node: HTMLElement, index: number) {
    stepNodes[index] = node;
    return {
      destroy() {
        stepNodes[index] = undefined as unknown as HTMLElement;
      },
    };
  }

  onMount(() => {
    let observer: IntersectionObserver | null = null;

    window.scrollTo({ top: 0, behavior: "auto" });

    tick().then(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const index = Number((entry.target as HTMLElement).dataset.step || "0");
            if (!Number.isNaN(index)) {
              inicioStory = true;
              activeStep = index;
            }
          });
        },
        {
          threshold: 0.35,
          rootMargin: "-14% 0px -40% 0px",
        },
      );

      stepNodes.forEach((node) => {
        if (node) observer?.observe(node);
      });
    });

    return () => observer?.disconnect();
  });
</script>

{#if mostrarLoader}
  <LoaderOverlay />
{/if}

<div class="story-page">
  <section class="map-stage">
    {#if pathGenerator && geojsonMunicipio}
      <svg viewBox="0 0 {width} {height}" class="responsive-svg" preserveAspectRatio="xMidYMid slice">
        <g>
          {#each features as feature}
            <path d={pathGenerator(feature as any)} class="base-path" stroke={strokeBase()} stroke-width={strokeWidthBase()} opacity="1" />
          {/each}
        </g>

        <g>
          {#each visiblesHighlight as feature}
            <path d={pathGenerator(feature as any)} class="gender-path" stroke={strokeColorHighlight()} stroke-width={strokeWidthHighlight()} />
          {/each}
        </g>
      </svg>
    {/if}
  </section>

  <section class="story-panels" aria-label="Relato del mapa">
    <StoryHeader showCounter={inicioStory} counter={counter} />

    <div class="story-steps">
      {#each storySteps as step, index}
        <article class="story-card" class:active={index === activeStep} data-step={index} use:setStepRef={index}>
          <h2>{step.title}</h2>
          <p>{step.message}</p>

          {#if index === 0}
            <p class="metric">{stats.totalCalles.toLocaleString("es-AR")} trazas totales</p>
          {:else if index === 1}
            <p class="metric">{stats.callesConNombre.toLocaleString("es-AR")} calles con nombre detectable</p>
          {:else if index === 2}
            <p class="metric">{stats.callesPersona.toLocaleString("es-AR")} calles asociadas a personas</p>
          {:else}
            <p class="metric">{stats.callesFemeninas.toLocaleString("es-AR")} calles con nombres femeninos</p>
          {/if}
        </article>
      {/each}
    </div>
  </section>
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Noto+Serif:wght@500;700;800&display=swap");

  :global(body) {
    margin: 0;
    padding: 14px;
    background: #2a141a;
    color: #fff4f4;
    font-family: "Noto Serif", Georgia, serif;
  }

  .story-page {
    position: relative;
    display: grid;
    grid-template-columns: minmax(250px, 30vw) 1fr;
    column-gap: 2px;
    min-height: 100vh;
  }

  .story-page > section,
  :global(section) {
    border: none;
  }

  .map-stage {
    grid-column: 2;
    position: sticky;
    top: 0;
    height: 100vh;
    background: #2a141a;
    overflow: hidden;
    border: none;
  }

  .map-stage::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: #2a141a;
    pointer-events: none;
  }

  .responsive-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .base-path,
  .gender-path {
    fill: none;
    stroke-linecap: round;
    transition: stroke 0.7s ease, stroke-width 0.7s ease, opacity 0.7s ease;
  }

  .story-panels {
    grid-column: 1;
    position: relative;
    z-index: 2;
    justify-self: end;
    width: min(94%, 420px);
    padding: 1vh 0 12vh 18px;
    border: none;
  }

  .story-steps {
    margin-top: 18vh;
  }

  .story-card {
    min-height: 58vh;
    margin-bottom: 16vh;
    padding: 6px 8px;
    border: none;
    background: transparent;
    color: #fff0f1;
    transition: opacity 700ms ease;
    opacity: 0.5;
  }

  .story-card.active {
    opacity: 1;
  }

  h2 {
    margin: 0;
    font-size: clamp(1.2rem, 3vw, 1.7rem);
    line-height: 1.05;
    color: #fff7f7;
    font-family: "Noto Serif", Georgia, serif;
  }

  .story-card p {
    margin-top: 6px;
    margin-bottom: 0;
    line-height: 1.3;
    font-size: 0.95rem;
    color: #fff7f7;
  }

  .metric {
    margin-top: 10px;
    font-size: 0.95rem;
    color: #a8c5ff;
    font-weight: 600;
  }

  @media (max-width: 720px) {
    :global(body) {
      padding: 8px;
    }

    .story-page {
      display: block;
    }

    .map-stage {
      height: 100svh;
    }

    .story-panels {
      margin-top: -100svh;
      padding-top: 34svh;
      padding-inline: 10px;
      width: auto;
    }

    .story-steps {
      margin-top: 26vh;
    }

    .story-card {
      min-height: 42svh;
      margin-bottom: 16svh;
      padding: 8px;
      text-align: center;
    }
  }
</style>

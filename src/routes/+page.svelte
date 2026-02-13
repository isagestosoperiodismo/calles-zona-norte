<script lang="ts">
  import { onMount, tick } from "svelte";
  import { geoPath, geoMercator } from "d3-geo";
  import { base } from "$app/paths";
  import { annotateGeojson } from "$lib/story/model";

  type MunicipioResumen = {
    slug: string;
    nombre: string;
    total: number;
    hombres: number;
    mujeres: number;
    personas: number;
    porcentajeHombres: number;
    porcentajeMujeres: number;
  };

  let { data } = $props();

  const stageWidth = 1300;
  const stageHeight = 1100;

  const storySteps = [
    {
      title: "Que dicen los nombres de calles en Zona Norte",
      message: "Mapa real de Tigre como fondo del relato.",
    },
    {
      title: "2.335 calles de personas",
      message: "Calles con nombres dedicados a personas sobre el total.",
    },
    {
      title: "2.242 calles de hombres",
      message: "La mayor parte de los homenajes sigue concentrada en varones.",
    },
    {
      title: "93 calles de mujeres",
      message: "La presencia femenina aparece, pero en una proporcion menor.",
    },
    {
      title: "Indice de municipios",
      message: "",
    },
  ];

  let activeStep = $state(0);
  let stepNodes: HTMLElement[] = [];
  let tigreGeojson = $state<any>(null);

  let resumen = $derived.by(() => (data.resumen as MunicipioResumen[]) ?? []);

  let municipiosIndex = $derived.by(() => {
    const wanted = [
      "tigre",
      "pilar",
      "escobar",
      "san-isidro",
      "vicente-lopez",
      "san-fernando",
      "malvinas-argentinas",
      "zona-norte",
    ];
    const bySlug = new Map(resumen.map((item) => [item.slug, item]));

    return wanted
      .map((slug) => bySlug.get(slug))
      .filter(Boolean)
      .map((item) => {
        const row = item as MunicipioResumen;
        return {
          ...row,
          label: prettifyName(row.nombre, row.slug),
          disabled: true,
        };
      });
  });

  let geojsonMunicipio = $derived.by(() =>
    annotateGeojson(tigreGeojson, data.tigreCalles, "tigre"),
  );

  let projection = $derived.by(() => {
    if (!geojsonMunicipio) return null;

    const featuresConNombre = geojsonMunicipio.features.filter(
      (f: any) => f.properties?.name && f.properties.name.trim() !== "",
    );

    return geoMercator().fitSize(
      [stageWidth - 20, stageHeight - 20],
      featuresConNombre.length > 0
        ? ({ ...geojsonMunicipio, features: featuresConNombre } as any)
        : (geojsonMunicipio as any),
    );
  });

  let pathGenerator = $derived(
    projection ? geoPath().projection(projection) : null,
  );

  let tigreFeatures = $derived(geojsonMunicipio?.features ?? []);
  let storyHighlightFeatures = $derived.by(() => {
    if (activeStep === 0) return tigreFeatures;
    if (activeStep === 1) return tigreFeatures.filter((f: any) => f.properties?.matched);
    if (activeStep === 2) return tigreFeatures.filter((f: any) => f.properties?.genero === "M");
    return tigreFeatures.filter((f: any) => f.properties?.genero === "F");
  });

  let storyBasePaths = $derived.by(() => {
    if (!pathGenerator) return [];
    return tigreFeatures
      .map((feature: any) => ({ d: pathGenerator(feature as any) }))
      .filter((item: any) => Boolean(item.d));
  });

  let storyHighlightPaths = $derived.by(() => {
    if (!pathGenerator) return [];
    return storyHighlightFeatures
      .map((feature: any) => ({ d: pathGenerator(feature as any) }))
      .filter((item: any) => Boolean(item.d));
  });

  function prettifyName(nombre: string, slug: string): string {
    if (slug === "zona-norte") return "Zona Norte";
    return (nombre || slug)
      .replace(/-/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  function storyStrokeColor(): string {
    if (activeStep <= 1) return "#c94758";
    if (activeStep === 2) return "#b13645";
    return "#ff7a86";
  }

  function setStepRef(node: HTMLElement, index: number) {
    stepNodes[index] = node;
    return {
      destroy() {
        stepNodes[index] = undefined as unknown as HTMLElement;
      },
    };
  }

  async function ensureTigreGeojson() {
    if (tigreGeojson) return;
    const res = await fetch(`${base}/tigre.geojson`);
    tigreGeojson = res.ok ? await res.json() : null;
  }

  onMount(() => {
    let observer: IntersectionObserver | null = null;

    ensureTigreGeojson();

    tick().then(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const index = Number((entry.target as HTMLElement).dataset.step || "0");
            if (!Number.isNaN(index)) activeStep = index;
          });
        },
        {
          threshold: 0.35,
          rootMargin: "-12% 0px -42% 0px",
        },
      );

      stepNodes.forEach((node) => {
        if (node) observer?.observe(node);
      });
    });

    return () => observer?.disconnect();
  });
</script>

<section class="scrolly-stage" aria-label="Scrollytelling Tigre">
  <div class="map-stage">
    {#if pathGenerator && geojsonMunicipio}
      <svg viewBox="0 0 {stageWidth} {stageHeight}" class="backdrop-svg" preserveAspectRatio="xMidYMid meet">
        <rect x="0" y="0" width={stageWidth} height={stageHeight} fill="#2a141a" />

        <g>
          {#each storyBasePaths as item}
            <path d={item.d} class="story-base" />
          {/each}
        </g>

        <g>
          {#each storyHighlightPaths as item}
            <path d={item.d} class="story-highlight" stroke={storyStrokeColor()} />
          {/each}
        </g>
      </svg>
    {/if}
  </div>

  <div class="story-panels" aria-label="Paneles del relato">
    {#each storySteps as step, index}
      <article class="story-card" class:active={index === activeStep} data-step={index} use:setStepRef={index}>
        <h2>{step.title}</h2>
        {#if step.message}
          <p>{step.message}</p>
        {/if}
      </article>
    {/each}
  </div>
</section>

<section class="municipios-index" aria-label="Indice de municipios">
  <div class="index-frame">
    <div class="index-map-line" aria-hidden="true"></div>

    <div class="index-columns">
      {#each municipiosIndex as row}
        <div class="index-row" class:disabled={row.disabled}>
          {#if row.slug === "tigre" && !row.disabled}
            <a href={`${base}/tigre/`} class="index-link">{row.label}</a>
          {:else}
            <span class="index-link muted">{row.label}</span>
          {/if}
          <span class="meta">{row.porcentajeMujeres}% calles de mujeres</span>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&display=swap");
  @import url("https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600&display=swap");

  :global(body) {
    margin: 0;
    background: #2a141a;
    color: #fff4f4;
    font-family: "Source Sans 3", sans-serif;
  }

  .scrolly-stage {
    position: relative;
    min-height: 420vh;
  }

  .map-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    z-index: 0;
    display: grid;
    place-items: center;
    overflow: hidden;
    background: #2a141a;
  }

  .backdrop-svg {
    width: min(96vw, 1400px);
    height: min(95vh, 1020px);
    display: block;
  }

  .story-base,
  .story-highlight {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .story-base {
    stroke: #4b2630;
    stroke-width: 0.95;
    opacity: 0.9;
  }

  .story-highlight {
    stroke-width: 1.8;
    transition: stroke 420ms ease;
  }

  .story-panels {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: grid;
    grid-template-columns: minmax(0, 780px);
    justify-content: center;
    align-content: start;
    justify-items: center;
    padding: 0 16px;
    pointer-events: none;
  }

  .story-card {
    pointer-events: none;
    min-height: 88vh;
    margin-bottom: 16vh;
    width: min(92vw, 900px);
    padding: 0;
    border: 0;
    outline: 0;
    box-shadow: none;
    background: transparent;
    opacity: 0.3;
    transition: opacity 320ms ease;
    display: grid;
    align-content: center;
    justify-items: center;
    text-align: center;
  }

  .story-card.active {
    opacity: 1;
  }

  .story-card h2 {
    margin: 0;
    font-size: clamp(2.2rem, 6.2vw, 5rem);
    line-height: 1.05;
    color: #fff4f5;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-style: italic;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-wrap: balance;
    text-shadow: none;
    -webkit-text-stroke: 0 transparent;
  }

  .story-card p {
    margin-top: 14px;
    font-size: clamp(1rem, 1.8vw, 1.25rem);
    line-height: 1.4;
    color: #e3c1c7;
    max-width: 44ch;
    font-family: "Source Sans 3", sans-serif;
  }

  .municipios-index {
    padding: clamp(22px, 4vw, 42px);
    background: #2a141a;
  }

  .index-frame {
    border: 1px solid #66343f;
    padding: 16px;
  }

  .index-map-line {
    height: 220px;
    border: 1px solid #5f303a;
    background:
      linear-gradient(120deg, rgba(235, 103, 123, 0.18) 0%, rgba(235, 103, 123, 0.03) 40%, rgba(235, 103, 123, 0.15) 100%),
      repeating-linear-gradient(0deg, rgba(235, 176, 188, 0.2) 0px, rgba(235, 176, 188, 0.2) 1px, transparent 1px, transparent 24px),
      repeating-linear-gradient(90deg, rgba(235, 176, 188, 0.18) 0px, rgba(235, 176, 188, 0.18) 1px, transparent 1px, transparent 24px);
  }

  .index-columns {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px 16px;
  }

  .index-row {
    display: grid;
    gap: 4px;
    align-content: start;
  }

  .index-row.disabled {
    opacity: 0.52;
  }

  .index-link {
    color: #ffd5dc;
    text-decoration: none;
    font-weight: 700;
    letter-spacing: 0.01em;
    font-family: "Source Sans 3", sans-serif;
  }

  .index-link:hover {
    color: #ff8d9b;
  }

  .index-link.muted {
    color: #d6a8b1;
  }

  .meta {
    color: #c59ea6;
    font-size: 0.84rem;
    font-family: "Source Sans 3", sans-serif;
  }

  @media (max-width: 980px) {
    .scrolly-stage {
      min-height: 360vh;
    }

    .story-panels {
      padding: 0 10px;
    }

    .story-card {
      min-height: 74vh;
      width: min(92vw, 760px);
      margin-bottom: 12vh;
    }

    .index-columns {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .index-columns {
      grid-template-columns: 1fr;
    }

    .index-map-line {
      height: 160px;
    }
  }
</style>

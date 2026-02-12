<script lang="ts">
  let { women = [] }: { women?: Array<{ nombre: string }> } = $props();
</script>

<section class="women-gallery" aria-label="Galeria de mujeres">
  <div class="gallery-grid">
    {#each women as mujer}
      <article class="gallery-card" aria-label={mujer.nombre}>
        <img
          class="portrait"
          src={"https://picsum.photos/seed/" + encodeURIComponent(mujer.nombre) + "/240/280"}
          alt={mujer.nombre}
          loading="lazy"
        />
        <h3>{mujer.nombre}</h3>
      </article>
    {/each}
  </div>
</section>

<style>
  .women-gallery {
    background: #2a141a;
    padding: 22px 10px 38px;
    border: none;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(120px, 1fr));
    gap: 14px 10px;
  }

  .gallery-card {
    background: transparent;
    padding: 0;
  }

  .portrait {
    width: 116px;
    height: 132px;
    border-radius: 50% / 40%;
    object-fit: cover;
    display: block;
    margin-bottom: 10px;
    filter:
      grayscale(1)
      contrast(1.34)
      brightness(0.9)
      sepia(1)
      hue-rotate(-16deg)
      saturate(2.5)
      drop-shadow(0 0 0 #7f2734);
    mix-blend-mode: multiply;
    background: transparent;
  }

  .gallery-card h3 {
    margin: 4px 0 0;
    font-size: 0.98rem;
    color: #ffe2e6;
    font-family: "Noto Serif", Georgia, serif;
  }

  @media (max-width: 720px) {
    .gallery-grid {
      grid-template-columns: repeat(2, minmax(120px, 1fr));
      gap: 16px 10px;
      justify-items: center;
    }
  }
</style>

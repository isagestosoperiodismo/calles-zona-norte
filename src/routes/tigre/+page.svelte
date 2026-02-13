<script lang="ts">
  import { base } from "$app/paths";
</script>

<main class="disabled-page">
  <h1>Tigre</h1>
  <p>Esta pagina esta temporalmente deshabilitada.</p>
  <a href={`${base}/`}>Volver al inicio</a>
</main>

<style>
  .disabled-page {
    min-height: 60vh;
    display: grid;
    place-content: center;
    gap: 10px;
    text-align: center;
    color: #ffeef1;
  }

  .disabled-page h1 {
    margin: 0;
    font-size: clamp(2rem, 5vw, 3.4rem);
    font-style: italic;
  }

  .disabled-page p {
    margin: 0;
    color: #dfbac2;
  }

  .disabled-page a {
    color: #ff9aa8;
    text-decoration: none;
  }
</style>

<script>
  let { children } = $props();
</script>

<svelte:head>
  <link rel="stylesheet" href="./style.css" />
  <link rel="stylesheet" href="./highlight-theme.css" />
</svelte:head>

<header>
  <h3>Este proyecto está en una verisón muy bb aún, paciencia ❤️</h3>
</header>

<main>
  {@render children()}
</main>

<footer>
  <p></p>
</footer>

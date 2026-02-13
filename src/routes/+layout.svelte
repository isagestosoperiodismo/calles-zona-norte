<script>
  import { base } from "$app/paths";
  let { children } = $props();
</script>

<svelte:head>
  <link rel="stylesheet" href={`${base}/style.css`} />
  <link rel="stylesheet" href={`${base}/highlight-theme.css`} />
</svelte:head>

<main>
  {@render children()}
</main>

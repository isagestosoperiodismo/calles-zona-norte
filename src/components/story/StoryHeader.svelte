<script lang="ts">
  let {
    showCounter = false,
    counter = { texto: "", detalle: "" },
  }: {
    showCounter?: boolean;
    counter?: { texto: string; detalle: string };
  } = $props();
</script>

<div class="intro-row">
  {#if showCounter}
    <div class="stats-fixed">
      <p class="stats-main">{counter.texto}</p>
      <p class="stats-sub">{counter.detalle}</p>
    </div>
  {/if}
  <div class="headline-block">
    <h1>¿Qué dicen los nombres de las calles en zona norte?</h1>
  </div>
</div>

<style>
  .intro-row {
    display: grid;
    gap: 14px;
    margin-bottom: 6vh;
  }

  .stats-fixed {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 8;
    width: min(360px, calc(100vw - 32px));
    padding: 10px 12px;
    background: rgba(48, 17, 25, 0.95);
    border-radius: 8px;
  }

  .stats-main {
    margin: 0;
    padding: 5px 0;
    font-size: 1rem;
    color: #ffe7e9;
    border-bottom: 1px solid rgba(255, 223, 228, 0.35);
  }

  .stats-sub {
    margin: 0;
    padding-top: 6px;
    font-size: 0.9rem;
    color: #f4bcc4;
  }

  .headline-block {
    display: grid;
    justify-items: end;
    gap: 8px;
    text-align: right;
  }

  .headline-block h1 {
    margin: 0;
    font-size: clamp(2.2rem, 5.4vw, 4rem);
    line-height: 1.03;
    letter-spacing: 0.01em;
    color: #fff7f7;
    font-family: "Noto Serif", Georgia, serif;
  }


  @media (max-width: 720px) {
    .stats-fixed {
      top: 10px;
      right: 12px;
      z-index: 7;
      padding: 8px 10px;
      width: auto;
      background: rgba(48, 17, 25, 0.96);
      border-radius: 8px;
      backdrop-filter: blur(2px);
    }

    .stats-main {
      border-bottom: 1px solid rgba(255, 225, 230, 0.35);
    }

    .headline-block {
      justify-items: center;
      text-align: center;
    }

    .headline-block h1 {
      text-shadow: 0 1px 0 rgba(0, 0, 0, 0.22);
      font-size: clamp(2rem, 10vw, 3rem);
    }

  }
</style>

<div class="loader-overlay" aria-live="polite" aria-label="Cargando mapa">
  <div class="pixel-loader" role="status">
    <svg class="mate-bitmap" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges">
      <rect x="8" y="1" width="1" height="5" fill="#ff9da5" />
      <rect x="9" y="1" width="1" height="1" fill="#ff9da5" />
      <rect x="10" y="1" width="1" height="1" fill="#ff9da5" />
      <rect x="7" y="6" width="4" height="1" fill="#ff9da5" />
      <rect x="4" y="4" width="8" height="1" fill="#a82736" />
      <rect x="3" y="5" width="10" height="1" fill="#a82736" />
      <rect x="2" y="6" width="12" height="1" fill="#a82736" />
      <rect x="2" y="7" width="12" height="1" fill="#d6454f" />
      <rect x="2" y="8" width="12" height="1" fill="#d6454f" />
      <rect x="3" y="9" width="10" height="1" fill="#d6454f" />
      <rect x="4" y="10" width="8" height="1" fill="#d6454f" />
      <rect x="5" y="11" width="6" height="1" fill="#d6454f" />
      <rect x="5" y="12" width="6" height="1" fill="#691f2b" />
    </svg>
    <p class="loader-text">pone la pava</p>
  </div>
</div>

<style>
  .loader-overlay {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at 20% 30%, #300d14 0, #300d14 8%, transparent 9%)
        0 0 / 22px 22px,
      radial-gradient(circle at 80% 70%, #23070d 0, #23070d 8%, transparent 9%)
        11px 11px / 22px 22px,
      #18070c;
  }

  .pixel-loader {
    display: grid;
    justify-items: center;
    gap: 10px;
    padding: 22px 28px;
    border: 3px solid #ca4f50;
    background: #2e0e15;
    box-shadow: 4px 4px 0 #120408;
  }

  .mate-bitmap {
    width: 112px;
    height: 112px;
    image-rendering: pixelated;
    animation: mate-float 0.8s steps(2) infinite alternate;
  }

  .loader-text {
    margin: 0;
    font-family: "Courier New", monospace;
    font-size: clamp(20px, 2.8vw, 32px);
    text-transform: lowercase;
    letter-spacing: 1px;
    color: #ffc0b8;
    text-shadow: 2px 2px 0 #6d1f2d;
  }

  @keyframes mate-float {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-4px);
    }
  }
</style>


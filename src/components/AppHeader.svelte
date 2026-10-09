<script lang="ts">
  // Adım 15: Ortak başlık ve gece / gündüz modu düğmesi
  import { tema } from "$lib/tema.svelte";
</script>

<header class="ust">
  <a href="/" class="logo" aria-label="CineQ ana sayfa"><img src="/cineq-logo.svg" alt="" width="28" height="28" />cine<span>Q</span></a>
  <button
    class="tema-dugme"
    onclick={() => tema.degistir()}
    aria-label={tema.mod === "gece" ? "Gündüz moduna geç" : "Gece moduna geç"}
  >
    {tema.mod === "gece" ? "☀️" : "🌙"}
  </button>
</header>

<style>
  .ust {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
    padding: calc(12px + env(safe-area-inset-top)) 16px 12px;
    background: var(--renk-koyu);
  }

  .logo {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    text-decoration: none;
  }

  .logo img {
    margin-inline-end: 8px;
  }

  .logo span {
    color: var(--renk-ana);
  }

  .tema-dugme {
    width: 38px;
    height: 38px;
    border: 1px solid #ffffff33;
    border-radius: 50%;
    background: #ffffff14;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

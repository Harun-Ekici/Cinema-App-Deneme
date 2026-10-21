<script lang="ts">
  // CineQ Ortak Üst Başlık (AppHeader) — Svelte 5 Runes
  import { tema, temaListesi } from "$lib/tema.svelte";

  const aktifTemaBilgi = $derived(
    temaListesi.find((t) => t.id === tema.secili) ?? temaListesi[0]
  );
</script>

<header class="ust">
  <div class="sol-alan">
    <a href="/" class="logo" aria-label="CineQ ana sayfa">
      <img src="/cineq-logo.svg" alt="CineQ Logo" width="28" height="28" />
      <span class="logo-metin">cine</span><span class="logo-vurgu">Q</span>
    </a>
  </div>

  <div class="sag-alan">
    <button
      type="button"
      class="tema-dugme"
      onclick={() => tema.degistir()}
      title={`Tema: ${aktifTemaBilgi.baslik} (Değiştirmek için tıkla)`}
      aria-label={`Tema: ${aktifTemaBilgi.baslik}`}
    >
      <span class="tema-ikon">{aktifTemaBilgi.ikon}</span>
    </button>
  </div>
</header>

<style>
  .ust {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 30;
    padding: calc(10px + env(safe-area-inset-top)) 18px 10px;
    background: var(--renk-koyu);
    border-bottom: 1px solid var(--kenar);
    height: 58px;
  }

  .sol-alan {
    display: flex;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    text-decoration: none;
  }

  .logo img {
    margin-inline-end: 8px;
    flex-shrink: 0;
  }

  .logo-metin {
    color: var(--header-yazi);
  }

  .logo-vurgu {
    color: var(--renk-ana);
  }

  .sag-alan {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .tema-dugme {
    width: 38px;
    height: 38px;
    border: 1px solid var(--kenar);
    border-radius: 50%;
    background: var(--kart);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease, border-color 0.15s ease;
  }

  .tema-dugme:hover {
    transform: scale(1.05);
    border-color: var(--renk-ana);
  }

  .tema-ikon {
    font-size: 18px;
  }
</style>

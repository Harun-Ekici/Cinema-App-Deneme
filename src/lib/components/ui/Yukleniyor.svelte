<script lang="ts">
  let { mesaj = "Yükleniyor", kartSayisi = 6 }: { mesaj?: string; kartSayisi?: number } = $props();
</script>

<div class="yukleniyor" role="status" aria-label={mesaj} aria-busy="true">
  <span class="sr-only">{mesaj}</span>
  <div class="iskelet-izgara" aria-hidden="true">
    {#each Array.from({ length: kartSayisi }) as _}
      <div class="iskelet-kart">
        <span class="iskelet-gorsel"></span>
        <span class="iskelet-baslik"></span>
        <span class="iskelet-metin"></span>
      </div>
    {/each}
  </div>
</div>

<style>
  .yukleniyor {
    width: 100%;
  }

  .iskelet-izgara {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    gap: var(--durum-aralik);
    width: 100%;
  }

  .iskelet-kart {
    display: flex;
    flex-direction: column;
    gap: var(--durum-oge-araligi);
    padding: var(--durum-ic-bosluk);
    border: var(--kart-kenar-genisligi) solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
  }

  .iskelet-gorsel,
  .iskelet-baslik,
  .iskelet-metin {
    display: block;
    border-radius: var(--kart-etiket-radius);
    background: var(--kenar);
    animation: iskelet-parla var(--durum-animasyon-suresi) ease-in-out infinite alternate;
  }

  .iskelet-gorsel {
    width: 100%;
    aspect-ratio: var(--kart-gorsel-orani);
    border-radius: var(--kart-gorsel-radius);
  }

  .iskelet-baslik {
    width: 72%;
    height: var(--durum-iskelet-baslik-yuksekligi);
  }

  .iskelet-metin {
    width: 48%;
    height: var(--durum-iskelet-metin-yuksekligi);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @keyframes iskelet-parla {
    from {
      opacity: var(--durum-iskelet-solukluk);
    }

    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .iskelet-gorsel,
    .iskelet-baslik,
    .iskelet-metin {
      animation: none;
    }
  }
</style>

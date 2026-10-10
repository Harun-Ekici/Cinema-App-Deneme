<script lang="ts">
  // CineQ Film Kartı Bileşeni — Svelte 5 Runes ($props, $derived)
  import { type Film, tl } from "$lib/data";

  let { etkinlik }: { etkinlik: Film } = $props();

  const enUcuz = $derived(
    etkinlik.biletler && etkinlik.biletler.length > 0
      ? Math.min(...etkinlik.biletler.map((b) => b.fiyat))
      : 150,
  );
</script>

<a href="/etkinlik/{etkinlik.id}" class="kart film-kart">
  <div class="afis" style:background={etkinlik.renk}>
    <div class="rozet-grup">
      <div class="ust-rozetler">
        <span class="rozet durum">{etkinlik.durum === "vizyonda" ? "Vizyonda" : "Pek Yakında"}</span>
        <span class="rozet yas">{etkinlik.yasSiniri}</span>
      </div>
      <span class="rozet salon">{etkinlik.salonTipi}</span>
    </div>
    <div class="imdb-rozet">
      <span>★ {etkinlik.imdb}</span>
    </div>
  </div>

  <div class="bilgi">
    <h3 class="baslik">{etkinlik.baslik}</h3>
    <p class="tur-sure">{etkinlik.tur} · {etkinlik.sure}</p>
    <p class="salon-ad">{etkinlik.salon}</p>

    <div class="seans-listesi">
      {#each etkinlik.seanslar as s}
        <span class="seans-hap">{s}</span>
      {/each}
    </div>

    <div class="fiyat-alani">
      <strong>{tl(enUcuz)}'den başlayan fiyatlarla</strong>
    </div>
  </div>
</a>

<style>
  .film-kart {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    text-decoration: none;
    color: var(--yazi);
    background: var(--kart);
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    height: 100%;
  }

  .film-kart:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px var(--kenar);
  }

  .afis {
    height: 150px;
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
  }

  .rozet-grup {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
  }

  .ust-rozetler {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .rozet {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.3px;
    background: var(--kart);
    color: var(--yazi);
    box-shadow: 0 2px 6px var(--kenar);
  }

  .rozet.yas {
    padding: 4px 8px;
    border: 1px solid var(--kenar);
    color: var(--renk-ana);
  }

  .rozet.salon {
    background: var(--renk-ana);
    color: var(--header-yazi);
  }

  .imdb-rozet {
    background: var(--renk-vurgu);
    color: var(--renk-koyu);
    font-size: 12px;
    font-weight: 800;
    padding: 4px 8px;
    border-radius: 8px;
  }

  .bilgi {
    padding: 14px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 6px;
  }

  .baslik {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--yazi);
  }

  .tur-sure {
    margin: 0;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .salon-ad {
    margin: 0;
    font-size: 12px;
    color: var(--yazi-soluk);
  }

  .seans-listesi {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-block-start: 6px;
  }

  .seans-hap {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 6px;
    background: var(--zemin);
    border: 1px solid var(--kenar);
    color: var(--yazi);
  }

  .fiyat-alani {
    margin-block-start: auto;
    padding-block-start: 10px;
  }

  strong {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: var(--renk-ana);
  }
</style>

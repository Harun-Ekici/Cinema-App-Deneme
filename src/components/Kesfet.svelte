<script lang="ts">
  // CineQ Keşfet Ekranı — Çift Filtre Barı, Responsive 4 Kademeli Izgara ve Svelte 5 Runes
  import EtkinlikKart from "$lib/components/EtkinlikKart.svelte";
  import { filmler, type FilmDurum, type SalonTipi } from "$lib/data";

  // Tab 1: Vizyon Durumu Filtresi
  const durumSekmeleri = ["Tümü", "Vizyondakiler", "Pek Yakında"] as const;
  type DurumSekme = (typeof durumSekmeleri)[number];
  let seciliDurum = $state<DurumSekme>("Tümü");

  // Tab 2: Salon Tipi Filtresi
  const salonSekmeleri = ["Tümü", "IMAX", "3D", "2D", "VIP Salon"] as const;
  type SalonSekme = (typeof salonSekmeleri)[number];
  let seciliSalon = $state<SalonSekme>("Tümü");

  // Canlı Metin Arama
  let arama = $state("");

  // $derived: Tüm filtreler reaktif olarak tek hamlede hesaplanır
  const filtrelenmisFilmler = $derived(
    filmler.filter((film) => {
      // 1. Durum filtreleme
      const durumUyumu =
        seciliDurum === "Tümü" ||
        (seciliDurum === "Vizyondakiler" && film.durum === "vizyonda") ||
        (seciliDurum === "Pek Yakında" && film.durum === "yakinda");

      // 2. Salon tipi filtreleme
      const salonUyumu =
        seciliSalon === "Tümü" || film.salonTipi === seciliSalon;

      // 3. Arama filtreleme (başlık, tür veya yönetmen)
      const aramaKucuk = arama.trim().toLocaleLowerCase("tr");
      const aramaUyumu =
        aramaKucuk === "" ||
        film.baslik.toLocaleLowerCase("tr").includes(aramaKucuk) ||
        film.tur.toLocaleLowerCase("tr").includes(aramaKucuk) ||
        film.yonetmen.toLocaleLowerCase("tr").includes(aramaKucuk);

      return durumUyumu && salonUyumu && aramaUyumu;
    }),
  );
</script>

<div class="sayfa kesfet-sayfa">
  <!-- Arama Çubuğu -->
  <div class="arama-kapsayici">
    <span class="arama-ikon" aria-hidden="true">🔍</span>
    <input
      class="arama"
      type="search"
      placeholder="Film adı, tür veya yönetmen ara..."
      bind:value={arama}
    />
    {#if arama.length > 0}
      <button class="temizle-btn" onclick={() => (arama = "")} aria-label="Aramayı temizle">✕</button>
    {/if}
  </div>

  <!-- Çift Filtre Barı -->
  <div class="filtre-gruplari">
    <!-- Bar 1: Vizyon Durumu -->
    <div class="filtre-cubugu bar-durum" role="tablist" aria-label="Vizyon Durumu">
      {#each durumSekmeleri as d}
        <button
          type="button"
          class="sekme-btn"
          class:aktif={seciliDurum === d}
          onclick={() => (seciliDurum = d)}
          role="tab"
          aria-selected={seciliDurum === d}
        >
          {d}
        </button>
      {/each}
    </div>

    <!-- Bar 2: Salon Tipi -->
    <div class="filtre-cubugu bar-salon" role="tablist" aria-label="Salon Tipi">
      {#each salonSekmeleri as s}
        <button
          type="button"
          class="sekme-btn"
          class:aktif={seciliSalon === s}
          onclick={() => (seciliSalon = s)}
          role="tab"
          aria-selected={seciliSalon === s}
        >
          {s}
        </button>
      {/each}
    </div>
  </div>

  <!-- Responsive Izgara Sırası: Telefon (1) -> Tablet (2) -> Masaüstü (3) -> Büyük Ekran (4) -->
  <div class="film-izgara">
    {#each filtrelenmisFilmler as film (film.id)}
      <EtkinlikKart etkinlik={film} />
    {:else}
      <div class="bos-durum">
        <span class="bos-ikon">🎬</span>
        <p class="bos-metin">Aramanıza veya seçilen filtrelere uygun film bulunamadı.</p>
        <button
          class="filtre-sifirla-btn"
          onclick={() => {
            seciliDurum = "Tümü";
            seciliSalon = "Tümü";
            arama = "";
          }}
        >
          Filtreleri Sıfırla
        </button>
      </div>
    {/each}
  </div>
</div>

<style>
  .kesfet-sayfa {
    max-width: 1400px;
    margin-inline: auto;
    width: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .arama-kapsayici {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .arama-ikon {
    position: absolute;
    inset-inline-start: 14px;
    font-size: 15px;
    color: var(--yazi-soluk);
    pointer-events: none;
  }

  .arama {
    width: 100%;
    padding: 12px 40px 12px 38px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    color: var(--yazi);
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .arama:focus {
    border-color: var(--renk-ana);
    box-shadow: 0 0 0 3px var(--kenar);
  }

  .temizle-btn {
    position: absolute;
    inset-inline-end: 12px;
    background: transparent;
    border: none;
    color: var(--yazi-soluk);
    font-size: 14px;
    padding: 4px;
    cursor: pointer;
  }

  .filtre-gruplari {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .filtre-cubugu {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-block: 2px;
    scrollbar-width: none;
  }

  .filtre-cubugu::-webkit-scrollbar {
    display: none;
  }

  .sekme-btn {
    flex-shrink: 0;
    padding: 8px 16px;
    border: 1px solid var(--kenar);
    border-radius: 999px;
    background: var(--kart);
    color: var(--yazi-soluk);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sekme-btn:hover {
    color: var(--yazi);
    border-color: var(--yazi-soluk);
  }

  .sekme-btn.aktif {
    background: var(--renk-ana);
    color: var(--header-yazi);
    border-color: var(--renk-ana);
    box-shadow: 0 2px 8px var(--kenar);
  }

  /* Responsive Izgara Sırası */
  /* 1. Telefon (Varsayılan): 1 Sütun */
  .film-izgara {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    width: 100%;
  }

  /* 2. Tablet (768px+): 2 Sütun */
  @media (min-width: 768px) {
    .film-izgara {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }

  /* 3. Masaüstü (1024px+): 3 Sütun */
  @media (min-width: 1024px) {
    .film-izgara {
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
  }

  /* 4. Büyük Ekran (1440px+): 4 Sütun */
  @media (min-width: 1440px) {
    .film-izgara {
      grid-template-columns: repeat(4, 1fr);
      gap: 28px;
    }
  }

  .bos-durum {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 16px;
    text-align: center;
    background: var(--kart);
    border: 1px dashed var(--kenar);
    border-radius: var(--radius);
    gap: 12px;
  }

  .bos-ikon {
    font-size: 38px;
  }

  .bos-metin {
    margin: 0;
    font-size: 15px;
    color: var(--yazi-soluk);
  }

  .filtre-sifirla-btn {
    padding: 8px 18px;
    border: 1px solid var(--renk-ana);
    border-radius: 999px;
    background: transparent;
    color: var(--renk-ana);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .filtre-sifirla-btn:hover {
    background: var(--renk-ana);
    color: var(--header-yazi);
  }
</style>

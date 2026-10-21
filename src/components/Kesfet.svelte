<script lang="ts">
  // CineQ Keşfet Ekranı — Çift Filtre Barı, Responsive 4 Kademeli Izgara ve Svelte 5 Runes
  import { onMount } from "svelte";
  import Kart from "$lib/components/ui/Kart.svelte";
  import BosDurum from "$lib/components/ui/BosDurum.svelte";
  import HataDurumu from "$lib/components/ui/HataDurumu.svelte";
  import Yukleniyor from "$lib/components/ui/Yukleniyor.svelte";
  import { filmler } from "$lib/data";
  import type { Film, KartProps } from "$lib/types";
  import {
    gelistirmeDurumunuAl,
    gelistirmeDurumunuTemizle,
    listeDurumMetinleri,
    uygulamaDiliniAl,
    type ListeDurumu,
    type UygulamaDili,
  } from "$lib/i18n/liste-durumlari";

  let listeDurumu = $state<ListeDurumu>("yukleniyor");
  let yuklenenFilmler = $state<Film[]>([]);
  let dil = $state<UygulamaDili>("tr");
  let filtreUrlHazir = $state(false);
  let metin = $derived(listeDurumMetinleri[dil]);

  onMount(() => {
    dil = uygulamaDiliniAl();
    const params = new URLSearchParams(window.location.search);
    arama = params.get("ara") ?? "";
    const vizyonDurumu = params.get("vizyon");
    if (vizyonDurumu === "vizyondakiler") seciliDurum = "Vizyondakiler";
    if (vizyonDurumu === "pek-yakinda") seciliDurum = "Pek Yakında";
    const salon = params.get("salon");
    if (salonSekmeleri.includes(salon as SalonSekme)) seciliSalon = salon as SalonSekme;
    filtreUrlHazir = true;
    void filmleriYukle();
  });

  async function filmleriYukle() {
    listeDurumu = "yukleniyor";

    try {
      await Promise.resolve();
      const testDurumu = gelistirmeDurumunuAl();

      if (testDurumu === "yukleniyor") return;
      if (testDurumu === "hata") throw new Error("Geliştirme hata durumu etkin.");

      yuklenenFilmler = testDurumu === "bos" ? [] : [...filmler];
      listeDurumu = yuklenenFilmler.length > 0 ? "dolu" : "bos";
    } catch (error) {
      yuklenenFilmler = [];
      listeDurumu = "hata";
      console.error("Film listesi yüklenemedi.", error);
    }
  }

  function tekrarYukle() {
    gelistirmeDurumunuTemizle();
    void filmleriYukle();
  }

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

  $effect(() => {
    if (!filtreUrlHazir || typeof window === "undefined") return;

    const url = new URL(window.location.href);
    for (const anahtar of ["ara", "vizyon", "salon"]) url.searchParams.delete(anahtar);
    if (arama.trim()) url.searchParams.set("ara", arama.trim());
    if (seciliDurum === "Vizyondakiler") url.searchParams.set("vizyon", "vizyondakiler");
    if (seciliDurum === "Pek Yakında") url.searchParams.set("vizyon", "pek-yakinda");
    if (seciliSalon !== "Tümü") url.searchParams.set("salon", seciliSalon);

    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  });

  // $derived: Tüm filtreler reaktif olarak tek hamlede hesaplanır
  const filtrelenmisFilmler = $derived(
    yuklenenFilmler.filter((film) => {
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
  let gorunenDurum = $derived(
    listeDurumu === "yukleniyor" || listeDurumu === "hata"
      ? listeDurumu
      : filtrelenmisFilmler.length === 0
        ? "bos"
        : "dolu",
  );

  function filmKartinaDonustur(film: Film): KartProps {
    const params = new URLSearchParams();
    if (arama.trim()) params.set("ara", arama.trim());
    if (seciliDurum === "Vizyondakiler") params.set("vizyon", "vizyondakiler");
    if (seciliDurum === "Pek Yakında") params.set("vizyon", "pek-yakinda");
    if (seciliSalon !== "Tümü") params.set("salon", seciliSalon);
    const localeOneki = dil === "tr" ? "" : `/${dil}`;
    const query = params.toString();

    return {
      baslik: film.baslik,
      altMetin: `${film.tur} · ${film.sure} · IMDb ${film.imdb}`,
      etiket: film.durum === "vizyonda" ? "Vizyonda" : "Pek Yakında",
      etiketTuru: film.durum === "vizyonda" ? "basari" : "bilgi",
      href: `${localeOneki}/film/${film.id}${query ? `?${query}` : ""}`,
    };
  }

  function filtreleriTemizle() {
    seciliDurum = "Tümü";
    seciliSalon = "Tümü";
    arama = "";
  }
</script>

<div class="sayfa kesfet-sayfa">
  {#if gorunenDurum === "yukleniyor"}
    <Yukleniyor mesaj={metin.yukleniyorFilmler} />
  {:else if gorunenDurum === "hata"}
    <HataDurumu mesaj={metin.filmHatasi} dugmeMetni={metin.tekrarDene} tekrarDene={tekrarYukle} />
  {:else}
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

    <div class="film-izgara">
      {#if gorunenDurum === "dolu"}
        {#each filtrelenmisFilmler as film (film.id)}
          <Kart {...filmKartinaDonustur(film)} />
        {/each}
      {:else}
        {#if yuklenenFilmler.length === 0}
          <BosDurum baslik={metin.filmYokBaslik} aciklama={metin.filmYokAciklama} />
        {:else}
          <BosDurum
            baslik={metin.sonucYokBaslik}
            aciklama={metin.aramaSonucuYok}
            dugmeMetni={metin.filtreleriTemizle}
            tikla={filtreleriTemizle}
          />
        {/if}
      {/if}
    </div>
  {/if}
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

  .film-izgara {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    width: 100%;
  }

  @media (min-width: 768px) {
    .film-izgara {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }

  @media (min-width: 1024px) {
    .film-izgara {
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
  }

  @media (min-width: 1440px) {
    .film-izgara {
      grid-template-columns: repeat(4, 1fr);
      gap: 28px;
    }
  }
</style>

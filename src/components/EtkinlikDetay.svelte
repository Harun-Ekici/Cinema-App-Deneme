<script lang="ts">
  // CineQ Film Detay Ekranı — Dinamik VIP Koltuk Fiyatlandırması, Yaş/Ses Rozetleri, Porsiyonlu Büfe (Svelte 5 Runes)
  import { type Film, bufeUrunleri, tl, type BufeUrunu, type BufePorsiyon } from "$lib/data";
  import { sepet } from "$lib/sepet.svelte";

  let { etkinlik: e }: { etkinlik: Film } = $props();

  // Seçili Seans
  let seciliSeans = $state("");
  $effect(() => {
    if (!seciliSeans && e.seanslar?.[0]) {
      seciliSeans = e.seanslar[0];
    }
  });

  // Seçili Bilet Tipi
  let seciliBiletIndex = $state(0);
  const seciliBilet = $derived(e.biletler[seciliBiletIndex] ?? { ad: "Tam", fiyat: 180 });

  // Koltuk Matrisi Verisi: 4 Sıra (A, B, C, D) × 6 Koltuk (1..6)
  const siralar = ["A", "B", "C", "D"];
  const koltukNumaralari = [1, 2, 3, 4, 5, 6];
  const doluKoltuklar = new Set(["A2", "A5", "B1", "C4", "C5"]);

  // Kullanıcının seçtiği koltuklar
  let seciliKoltuklar = $state<string[]>(["B3"]);

  function koltukTikla(kod: string) {
    if (doluKoltuklar.has(kod)) return;
    if (seciliKoltuklar.includes(kod)) {
      seciliKoltuklar = seciliKoltuklar.filter((k) => k !== kod);
    } else {
      if (seciliKoltuklar.length >= 6) {
        alert("Tek seferde en fazla 6 koltuk seçebilirsiniz.");
        return;
      }
      seciliKoltuklar = [...seciliKoltuklar, kod];
    }
  }

  // Dinamik Koltuk Fiyatlandırması: D Sırası VIP (+50 TL Fark)
  const VIP_EK_UCRET = 50;
  const vipKoltukSayisi = $derived(seciliKoltuklar.filter((k) => k.startsWith("D")).length);
  const standartKoltukSayisi = $derived(seciliKoltuklar.length - vipKoltukSayisi);

  const biletToplam = $derived(
    standartKoltukSayisi * seciliBilet.fiyat +
      vipKoltukSayisi * (seciliBilet.fiyat + VIP_EK_UCRET)
  );

  // Büfe Siparişleri ve Porsiyon Yönetimi
  // urunId -> { porsiyonIndex: number, adet: number }
  let bufeSecimleri = $state<Record<string, { porsiyonIndex: number; adet: number }>>({});

  function porsiyonSec(urunId: string, index: number) {
    const mev = bufeSecimleri[urunId] ?? { porsiyonIndex: 0, adet: 0 };
    bufeSecimleri = {
      ...bufeSecimleri,
      [urunId]: { ...mev, porsiyonIndex: index },
    };
  }

  function bufeArtir(u: BufeUrunu) {
    const mev = bufeSecimleri[u.id] ?? { porsiyonIndex: 0, adet: 0 };
    bufeSecimleri = {
      ...bufeSecimleri,
      [u.id]: { ...mev, adet: mev.adet + 1 },
    };
  }

  function bufeAzalt(u: BufeUrunu) {
    const mev = bufeSecimleri[u.id];
    if (mev && mev.adet > 0) {
      bufeSecimleri = {
        ...bufeSecimleri,
        [u.id]: { ...mev, adet: mev.adet - 1 },
      };
    }
  }

  function bufeBirimFiyat(u: BufeUrunu): number {
    const secim = bufeSecimleri[u.id];
    if (u.porsiyonlar && u.porsiyonlar.length > 0) {
      const idx = secim ? secim.porsiyonIndex : 0;
      return u.porsiyonlar[idx]?.fiyat ?? u.fiyat;
    }
    return u.fiyat;
  }

  const bufeToplam = $derived(
    bufeUrunleri.reduce((toplam, u) => {
      const secim = bufeSecimleri[u.id];
      if (!secim || secim.adet <= 0) return toplam;
      return toplam + secim.adet * bufeBirimFiyat(u);
    }, 0)
  );

  const genelToplam = $derived(biletToplam + bufeToplam);

  function sepeteEkleVeGit() {
    if (seciliKoltuklar.length === 0) {
      alert("Lütfen en az 1 koltuk seçin.");
      return;
    }

    // 1. Film Biletini Ekle
    sepet.ekleBilet(
      e,
      seciliBilet,
      seciliSeans,
      e.salon,
      seciliKoltuklar,
      seciliKoltuklar.length,
      vipKoltukSayisi,
      biletToplam
    );

    // 2. Seçilen Büfe Ürünlerini Ekle
    for (const u of bufeUrunleri) {
      const secim = bufeSecimleri[u.id];
      if (secim && secim.adet > 0) {
        const porsiyon = u.porsiyonlar?.[secim.porsiyonIndex];
        const birimFiyat = porsiyon?.fiyat ?? u.fiyat;
        sepet.ekleBufe(u, secim.adet, porsiyon?.ad, birimFiyat);
      }
    }

    if (typeof window !== "undefined") {
      window.location.href = "/sepet";
    }
  }
</script>

<div class="detay-kapsayici">
  <!-- Üst Afiş Alanı -->
  <div class="afis" style:background={e.renk}>
    <div class="etiketler">
      <span class="rozet durum">{e.durum === "vizyonda" ? "Vizyonda" : "Pek Yakında"}</span>
      <span class="rozet salon">{e.salonTipi}</span>
      <span class="rozet imdb">★ {e.imdb}</span>
      <span class="rozet yas">{e.yasSiniri}</span>
      {#each e.formatlar as f}
        <span class="rozet format">{f}</span>
      {/each}
    </div>
    <h1 class="film-baslik">{e.baslik}</h1>
    <p class="film-ozet">{e.tur} · {e.sure} · {e.salon}</p>
  </div>

  <div class="sayfa icerik-alani">
    <!-- Film Künyesi & Sinopsis -->
    <div class="kart bilgi-karti">
      <h3>Sinopsis</h3>
      <p class="aciklama">{e.aciklama}</p>
      <div class="kunye">
        <p><strong>Yönetmen:</strong> {e.yonetmen}</p>
        <p><strong>Oyuncular:</strong> {e.oyuncular.join(", ")}</p>
      </div>
    </div>

    <!-- Seans Saati Seçimi -->
    <div class="bolum">
      <h2>1. Seans Saati Seçin</h2>
      <div class="seans-secenekleri">
        {#each e.seanslar as s}
          <button
            type="button"
            class="seans-btn"
            class:aktif={seciliSeans === s}
            onclick={() => (seciliSeans = s)}
          >
            {s}
          </button>
        {/each}
      </div>
    </div>

    <!-- Bilet Tipi Seçimi -->
    <div class="bolum">
      <h2>2. Bilet Kategorisi</h2>
      <div class="bilet-secenekleri">
        {#each e.biletler as b, i}
          <label class="kart bilet-karti" class:aktif={seciliBiletIndex === i}>
            <input type="radio" name="bilet-tipi" value={i} bind:group={seciliBiletIndex} />
            <span class="ad">{b.ad}</span>
            <strong class="fiyat">{tl(b.fiyat)}</strong>
          </label>
        {/each}
      </div>
    </div>

    <!-- İnteraktif Koltuk Seçim Matrisi -->
    <div class="bolum">
      <div class="bolum-baslik-satir">
        <h2>3. Koltuk Seçin ({seciliKoltuklar.length} seçildi)</h2>
        {#if vipKoltukSayisi > 0}
          <span class="vip-bilgi-etiket">✨ {vipKoltukSayisi}x VIP (+{tl(vipKoltukSayisi * VIP_EK_UCRET)})</span>
        {/if}
      </div>

      <div class="kart salon-plani">
        <div class="perde">
          <div class="perde-cizgi"></div>
          <span>PERDE / SCREEN</span>
        </div>

        <div class="koltuk-matrisi">
          {#each siralar as sira}
            <div class="sira-satir">
              <span class="sira-harf">{sira}</span>
              <div class="sira-koltuklar">
                {#each koltukNumaralari as no}
                  {@const kod = `${sira}${no}`}
                  {@const dolu = doluKoltuklar.has(kod)}
                  {@const secili = seciliKoltuklar.includes(kod)}
                  {@const vip = sira === "D"}
                  <button
                    type="button"
                    class="koltuk"
                    class:dolu
                    class:secili
                    class:vip
                    disabled={dolu}
                    onclick={() => koltukTikla(kod)}
                    aria-label={`Koltuk ${kod} ${dolu ? "Dolu" : secili ? "Seçili" : "Boş"} ${vip ? "VIP" : "Standart"}`}
                  >
                    {kod}
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <div class="koltuk-lejant">
          <div class="lejant-oge"><span class="kutu bos"></span> Boş</div>
          <div class="lejant-oge"><span class="kutu secili"></span> Seçili</div>
          <div class="lejant-oge"><span class="kutu dolu"></span> Dolu</div>
          <div class="lejant-oge"><span class="kutu vip"></span> VIP Sıra (+50 TL)</div>
        </div>
      </div>
    </div>

    <!-- Büfe Menüsü Entegrasyonu (Porsiyonlu) -->
    <div class="bolum">
      <h2>4. Sinema Büfesi Ekle (Opsiyonel)</h2>
      <div class="bufe-listesi">
        {#each bufeUrunleri as u}
          {@const secim = bufeSecimleri[u.id] ?? { porsiyonIndex: 0, adet: 0 }}
          <div class="kart bufe-karti">
            <span class="bufe-ikon">{u.ikon}</span>
            <div class="bufe-bilgi">
              <div class="bufe-baslik-satir">
                <strong>{u.ad}</strong>
                {#if u.rozet}
                  <span class="bufe-rozet">{u.rozet}</span>
                {/if}
              </div>
              <p>{u.aciklama}</p>

              {#if u.porsiyonlar && u.porsiyonlar.length > 0}
                <div class="porsiyon-secici">
                  {#each u.porsiyonlar as p, pi}
                    <button
                      type="button"
                      class="porsiyon-btn"
                      class:aktif={secim.porsiyonIndex === pi}
                      onclick={() => porsiyonSec(u.id, pi)}
                    >
                      {p.ad} ({tl(p.fiyat)})
                    </button>
                  {/each}
                </div>
              {:else}
                <span class="bufe-fiyat">{tl(u.fiyat)}</span>
              {/if}
            </div>

            <div class="bufe-adet-kontrol">
              <button
                type="button"
                class="sayac-btn"
                onclick={() => bufeAzalt(u)}
                disabled={secim.adet <= 0}
                aria-label="Azalt"
              >
                −
              </button>
              <b class="adet-sayi">{secim.adet}</b>
              <button
                type="button"
                class="sayac-btn"
                onclick={() => bufeArtir(u)}
                aria-label="Artır"
              >
                +
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Sipariş Özeti & Sepete Ekle -->
    <div class="kart siparis-ozet-karti">
      <div class="ozet-satir">
        <span>Bilet ({seciliKoltuklar.length} adet: {seciliKoltuklar.join(", ")})</span>
        <b>{tl(biletToplam)}</b>
      </div>
      {#if vipKoltukSayisi > 0}
        <div class="ozet-satir alt-detay">
          <span>↳ Standart ({standartKoltukSayisi}) + VIP ({vipKoltukSayisi}x +{tl(VIP_EK_UCRET)})</span>
          <span>Dinamik Fiyat</span>
        </div>
      {/if}
      {#if bufeToplam > 0}
        <div class="ozet-satir">
          <span>Büfe Siparişleri</span>
          <b>{tl(bufeToplam)}</b>
        </div>
      {/if}
      <div class="ozet-satir toplam-vurgu">
        <span>Genel Toplam</span>
        <span class="toplam-rakam">{tl(genelToplam)}</span>
      </div>

      <button class="btn satin-al-btn" onclick={sepeteEkleVeGit}>
        Sepete Ekle & İlerle · {tl(genelToplam)}
      </button>
    </div>
  </div>
</div>

<style>
  .detay-kapsayici {
    max-width: 1000px;
    margin-inline: auto;
    width: 100%;
  }

  .afis {
    padding: 36px 18px 24px;
    color: var(--header-yazi);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .etiketler {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .rozet {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    background: var(--kart);
    color: var(--yazi);
  }

  .rozet.salon {
    background: var(--renk-ana);
    color: var(--header-yazi);
  }

  .rozet.imdb {
    background: var(--renk-vurgu);
    color: var(--renk-koyu);
  }

  .rozet.yas {
    background: var(--kart);
    border: 1px solid var(--kenar);
    color: var(--renk-ana);
  }

  .rozet.format {
    background: var(--zemin);
    color: var(--yazi);
    opacity: 0.95;
  }

  .film-baslik {
    margin: 4px 0 0;
    font-size: 24px;
    font-weight: 800;
    line-height: 1.2;
    color: var(--header-yazi);
  }

  .film-ozet {
    margin: 0;
    font-size: 14px;
    color: var(--header-yazi);
    opacity: 0.9;
  }

  .icerik-alani {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .bilgi-karti {
    padding: 16px;
  }

  .bilgi-karti h3 {
    margin: 0 0 8px;
    font-size: 16px;
    color: var(--yazi);
  }

  .aciklama {
    margin: 0 0 12px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--yazi-soluk);
  }

  .kunye p {
    margin: 4px 0;
    font-size: 13px;
    color: var(--yazi);
  }

  .bolum h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--yazi);
  }

  .bolum-baslik-satir {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-block-end: 10px;
  }

  .vip-bilgi-etiket {
    font-size: 12px;
    font-weight: 700;
    color: var(--vip-renk);
    background: var(--kart);
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid var(--kenar);
  }

  .seans-secenekleri {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-block-start: 10px;
  }

  .seans-btn {
    padding: 10px 18px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    color: var(--yazi);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .seans-btn.aktif {
    background: var(--renk-ana);
    color: var(--header-yazi);
    border-color: var(--renk-ana);
  }

  .bilet-secenekleri {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
    margin-block-start: 10px;
  }

  .bilet-karti {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    cursor: pointer;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    transition: border-color 0.2s ease;
  }

  .bilet-karti.aktif {
    border-color: var(--renk-ana);
    background: var(--zemin);
  }

  .bilet-karti input {
    margin-inline-end: 8px;
  }

  .bilet-karti .ad {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: var(--yazi);
  }

  .bilet-karti .fiyat {
    font-size: 14px;
    color: var(--renk-ana);
  }

  /* Salon Planı ve Koltuklar */
  .salon-plani {
    padding: 18px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .perde {
    width: 80%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .perde-cizgi {
    width: 100%;
    height: 4px;
    background: var(--renk-ana);
    border-radius: 4px;
  }

  .perde span {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--yazi-soluk);
  }

  .koltuk-matrisi {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    max-width: 440px;
  }

  .sira-satir {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .sira-harf {
    font-size: 12px;
    font-weight: 700;
    color: var(--yazi-soluk);
    width: 14px;
    text-align: center;
  }

  .sira-koltuklar {
    display: flex;
    gap: 8px;
  }

  .koltuk {
    width: 38px;
    height: 34px;
    border: 1px solid var(--kenar);
    border-radius: 8px;
    background: var(--kart);
    color: var(--yazi);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .koltuk:hover:not(.dolu) {
    border-color: var(--renk-ana);
  }

  .koltuk.vip {
    border-color: var(--vip-renk);
  }

  .koltuk.secili {
    background: var(--renk-ana);
    color: var(--header-yazi);
    border-color: var(--renk-ana);
  }

  .koltuk.dolu {
    background: var(--kenar);
    color: var(--yazi-soluk);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .koltuk-lejant {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    justify-content: center;
    font-size: 12px;
    color: var(--yazi-soluk);
  }

  .lejant-oge {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .kutu {
    width: 14px;
    height: 14px;
    border-radius: 4px;
    display: inline-block;
  }

  .kutu.bos {
    background: var(--kart);
    border: 1px solid var(--kenar);
  }

  .kutu.secili {
    background: var(--renk-ana);
  }

  .kutu.dolu {
    background: var(--kenar);
  }

  .kutu.vip {
    background: var(--kart);
    border: 1px solid var(--vip-renk);
  }

  /* Büfe Kartları & Porsiyonlar */
  .bufe-listesi {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-block-start: 10px;
  }

  .bufe-karti {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
  }

  .bufe-ikon {
    font-size: 28px;
  }

  .bufe-bilgi {
    flex: 1;
  }

  .bufe-baslik-satir {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bufe-bilgi strong {
    font-size: 14px;
    color: var(--yazi);
  }

  .bufe-rozet {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--renk-vurgu);
    color: var(--header-yazi);
  }

  .bufe-bilgi p {
    margin: 2px 0 6px;
    font-size: 12px;
    color: var(--yazi-soluk);
  }

  .porsiyon-secici {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .porsiyon-btn {
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid var(--kenar);
    background: var(--zemin);
    color: var(--yazi);
    cursor: pointer;
  }

  .porsiyon-btn.aktif {
    background: var(--renk-ana);
    color: var(--header-yazi);
    border-color: var(--renk-ana);
  }

  .bufe-fiyat {
    font-size: 13px;
    font-weight: 700;
    color: var(--renk-ana);
  }

  .bufe-adet-kontrol {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sayac-btn {
    width: 32px;
    height: 32px;
    border: 1px solid var(--kenar);
    border-radius: 50%;
    background: var(--kart);
    color: var(--yazi);
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sayac-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .adet-sayi {
    min-width: 18px;
    text-align: center;
    font-size: 14px;
    color: var(--yazi);
  }

  /* Sipariş Özet Kartı */
  .siparis-ozet-karti {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ozet-satir {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: var(--yazi);
  }

  .ozet-satir.alt-detay {
    font-size: 12px;
    color: var(--yazi-soluk);
    padding-inline-start: 12px;
  }

  .ozet-satir.toplam-vurgu {
    padding-block-start: 8px;
    border-block-start: 1px dashed var(--kenar);
    font-size: 16px;
    font-weight: 700;
  }

  .toplam-rakam {
    color: var(--renk-ana);
    font-size: 18px;
  }

  .satin-al-btn {
    margin-block-start: 8px;
    cursor: pointer;
  }
</style>

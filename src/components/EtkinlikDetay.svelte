<script lang="ts">
  // CineQ film detay, SQLite seans ve salon haritası.
  import { onMount } from "svelte";
  import { tl } from "$lib/data";
  import type { BufeUrunu, Film } from "$lib/types";
  import { vitrinVerileriniYukle } from "$lib/katalog";
  import { biletlerim } from "$lib/biletler.svelte";
  import { sepet } from "$lib/sepet.svelte";
  import { filmDetayMetinleri } from "$lib/i18n/film-detay";
  import type { UygulamaDili } from "$lib/i18n/liste-durumlari";

  let { etkinlik: ilkFilm, filmId: ilkFilmId, lang = "tr" }: { etkinlik?: Film; filmId?: string; lang?: UygulamaDili } = $props();
  const bosFilm: Film = {
    id: 0,
    baslik: "",
    tur: "Dram",
    durum: "yakinda",
    salonTipi: "2D",
    sure: "",
    imdb: 0,
    yasSiniri: "Genel",
    formatlar: [],
    yonetmen: "",
    oyuncular: [],
    salon: "",
    seanslar: [],
    renk: "var(--zemin)",
    aciklama: "",
    biletler: [],
  };
  let e = $state<Film>(ilkFilm ?? bosFilm);
  let yukleniyor = $state(true);
  let hata = $state("");
  let bufeUrunleri = $state<BufeUrunu[]>([]);
  let filtreQuery = $state("");
  let metin = $derived(filmDetayMetinleri[lang]);
  let geriDonUrl = $derived(`${lang === "tr" ? "" : `/${lang}`}/${filtreQuery ? `?${filtreQuery}` : ""}`);

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const filmId = params.get("id") ?? ilkFilmId ?? String(ilkFilm?.id ?? "");
    const listeParametreleri = new URLSearchParams();
    for (const anahtar of ["ara", "vizyon", "salon"]) {
      const deger = params.get(anahtar);
      if (deger) listeParametreleri.set(anahtar, deger);
    }
    filtreQuery = listeParametreleri.toString();
    void filmiYukle(filmId);
  });

  async function filmiYukle(id: string) {
    yukleniyor = true;
    hata = "";
    try {
      if (!/^\d+$/.test(id)) throw new Error("Film kimliği geçersiz.");
      const [catalog] = await Promise.all([
        vitrinVerileriniYukle(lang),
        biletlerim.yenile(),
      ]);
      const film = catalog.films.find((item) => item.id === Number(id));
      if (!film) throw new Error("Bu film SQLite kataloğunda bulunamadı.");
      e = film;
      bufeUrunleri = catalog.bufe;
      seciliSeans = film.gosterimSeanslari?.[0]?.id ?? "";
      seciliKoltuklar = [];
    } catch (reason) {
      hata = reason instanceof Error ? reason.message : "Film bilgileri yüklenemedi.";
    } finally {
      yukleniyor = false;
    }
  }

  let seciliSeans = $state("");
  let seciliKoltuklar = $state<string[]>([]);
  let biletTuru = $state<"tam" | "ogrenci">("tam");
  const seanslar = $derived(e.gosterimSeanslari ?? []);
  const aktifSeans = $derived(seanslar.find((session) => session.id === seciliSeans));
  const harita = $derived(aktifSeans?.salon.harita);
  const satirlar = $derived(Array.from({ length: harita?.satir ?? 0 }, (_, index) => index));
  const sutunlar = $derived(Array.from({ length: harita?.sutun ?? 0 }, (_, index) => index));
  const doluKoltuklar = $derived(new Set((aktifSeans?.doluKoltuklar ?? []).map((seat) => `${seat.satir}:${seat.sutun}`)));
  const kendiKoltuklar = $derived(new Set(
    biletlerim.liste
      .filter((ticket) => ticket.seansId === seciliSeans && ticket.durum !== "iptal")
      .flatMap((ticket) => ticket.koltuklar.map((seat) => {
        const match = /^([A-Z])(\d+)$/.exec(seat);
        return match ? `${(match[1]?.charCodeAt(0) ?? 65) - 65}:${Number(match[2]) - 1}` : "";
      })),
  ));

  function koltukKodu(key: string) {
    const [row, column] = key.split(":").map(Number);
    return `${String.fromCharCode(65 + row)}${column + 1}`;
  }

  function koltukTikla(key: string) {
    if (doluKoltuklar.has(key)) return;
    if (seciliKoltuklar.includes(key)) {
      seciliKoltuklar = seciliKoltuklar.filter((seat) => seat !== key);
    } else {
      if (seciliKoltuklar.length >= 6) {
        alert(metin.maxKoltukUyarisi);
        return;
      }
      seciliKoltuklar = [...seciliKoltuklar, key];
    }
  }

  const vipKoltukSayisi = $derived(
    seciliKoltuklar.filter((seat) => harita?.vipSatirlari.includes(Number(seat.split(":")[0]))).length
  );
  const standartKoltukSayisi = $derived(seciliKoltuklar.length - vipKoltukSayisi);
  const standartFiyat = $derived(biletTuru === "ogrenci"
    ? aktifSeans?.fiyat.ogrenci ?? 0
    : aktifSeans?.fiyat.tam ?? aktifSeans?.fiyat.standart ?? 0);
  const vipFiyat = $derived(aktifSeans?.fiyat.vip ?? standartFiyat);
  const biletToplam = $derived(
    standartKoltukSayisi * standartFiyat + vipKoltukSayisi * vipFiyat
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
    if (!aktifSeans) {
      alert("Lütfen bir seans seçin.");
      return;
    }
    if (seciliKoltuklar.length === 0) {
      alert(metin.enAzBirKoltukUyarisi);
      return;
    }

    // 1. Film Biletini Ekle
    sepet.ekleBilet(
      e,
      { ad: biletTuru === "ogrenci" ? "Öğrenci" : "Tam", fiyat: standartFiyat },
      aktifSeans.baslangic.slice(11, 16),
      aktifSeans.salon.ad,
      seciliKoltuklar.map(koltukKodu),
      seciliKoltuklar.length,
      vipKoltukSayisi,
      biletToplam,
      aktifSeans.id
    );

    // 2. Seçilen Büfe Ürünlerini Ekle
    for (const u of bufeUrunleri) {
      const secim = bufeSecimleri[u.id];
      if (secim && secim.adet > 0) {
        const porsiyon = u.porsiyonlar?.[secim.porsiyonIndex];
        const birimFiyat = porsiyon?.fiyat ?? u.fiyat;
        sepet.ekleBufe(u, secim.adet, porsiyon?.ad ?? u.boyut, birimFiyat);
      }
    }

    if (typeof window !== "undefined") {
      window.location.href = "/sepet";
    }
  }
</script>

{#if yukleniyor}
  <div class="sayfa"><p role="status">Film ve seans bilgileri yükleniyor...</p></div>
{:else if hata}
  <div class="sayfa" role="alert">
    <p>{hata}</p>
    <button class="btn" type="button" onclick={() => void filmiYukle(new URLSearchParams(window.location.search).get("id") ?? ilkFilmId ?? String(ilkFilm?.id ?? ""))}>Tekrar dene</button>
  </div>
{:else}
<div class="detay-kapsayici">
  <a class="geri-don" href={geriDonUrl}>← {metin.geriDon}</a>
  <!-- Üst Afiş Alanı -->
  <div class="afis" style:background={e.renk}>
    <div class="etiketler">
      <span class="rozet durum">{e.durum === "vizyonda" ? metin.vizyonda : metin.yakinda}</span>
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
      <h3>{metin.sinopsis}</h3>
      <p class="aciklama">{e.aciklama}</p>
      <div class="kunye">
        <p><strong>{metin.yonetmen}:</strong> {e.yonetmen}</p>
        <p><strong>{metin.oyuncular}:</strong> {e.oyuncular.join(", ")}</p>
      </div>
    </div>

    <!-- Seans Saati Seçimi -->
    <div class="bolum">
      <h2>{metin.seansSec}</h2>
      <div class="seans-secenekleri">
        {#each seanslar as session}
          {@const s = session.baslangic.slice(11, 16)}
          <button
            type="button"
            class="seans-btn"
            class:aktif={seciliSeans === session.id}
            onclick={() => { seciliSeans = session.id; seciliKoltuklar = []; }}
          >
            {s} · {session.salon.sinema} · {session.salon.ad} · {session.salon.sehir}
          </button>
        {/each}
        {#if seanslar.length === 0}
          <p>Bu film için henüz seans planlanmadı.</p>
        {/if}
      </div>
    </div>

    <!-- İnteraktif Koltuk Seçim Matrisi -->
    <div class="bolum">
      <div class="bolum-baslik-satir">
        <h2>{metin.koltukSec(seciliKoltuklar.length)}</h2>
        {#if vipKoltukSayisi > 0}
          <span class="vip-bilgi-etiket">{vipKoltukSayisi}x VIP · {tl(vipFiyat)} / koltuk</span>
        {/if}
      </div>
      <label class="bilet-turu-secici">
        <span>Bilet türü</span>
        <select bind:value={biletTuru}>
          <option value="tam">Tam · {tl(aktifSeans?.fiyat.tam ?? standartFiyat)}</option>
          <option value="ogrenci">Öğrenci · {tl(aktifSeans?.fiyat.ogrenci ?? 0)}</option>
        </select>
      </label>

      <div class="kart salon-plani">
        <div class="perde">
          <div class="perde-cizgi"></div>
          <span>{metin.perde}</span>
        </div>

        {#if aktifSeans && harita}
        <div class="koltuk-matrisi">
          {#each satirlar as satir}
            {@const sira = String.fromCharCode(65 + satir)}
            <div class="sira-satir">
              <span class="sira-harf">{sira}</span>
              <div class="sira-koltuklar">
                {#each sutunlar as sutun}
                  {#if harita.koridorSutunlari.includes(sutun)}
                    <span class="koltuk-koridor" aria-hidden="true"></span>
                  {:else}
                  {@const key = `${satir}:${sutun}`}
                  {@const kod = `${sira}${sutun + 1}`}
                  {@const kullanilamaz = harita.kullanilamaz.some((seat) => seat.satir === satir && seat.sutun === sutun)}
                  {@const dolu = kullanilamaz || doluKoltuklar.has(key)}
                  {@const kendi = kendiKoltuklar.has(key)}
                  {@const secili = seciliKoltuklar.includes(key)}
                  {@const vip = harita.vipSatirlari.includes(satir)}
                  <button
                    type="button"
                    class="koltuk"
                    class:dolu
                    class:secili
                    class:vip
                    class:kullanilamaz
                    class:kendi
                    disabled={dolu}
                    onclick={() => koltukTikla(key)}
                    aria-label={metin.koltukAria(
                      kod,
                      kullanilamaz ? "kullanılamaz" : kendi ? "Size ait bilet" : dolu ? metin.dolu : secili ? metin.secili : metin.bos,
                      vip ? metin.vip : metin.standart,
                    )}
                  >
                    {kod}
                  </button>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}
        </div>
        {:else}
          <p>Seans seçerek salon yerleşimini görüntüleyin.</p>
        {/if}

        <div class="koltuk-lejant">
          <div class="lejant-oge"><span class="kutu bos"></span> {metin.bos}</div>
          <div class="lejant-oge"><span class="kutu secili"></span> {metin.secili}</div>
          <div class="lejant-oge"><span class="kutu dolu"></span> {metin.dolu}</div>
          <div class="lejant-oge"><span class="kutu kendi"></span> Size ait bilet</div>
          <div class="lejant-oge"><span class="kutu vip"></span> {metin.vipSira} · {tl(vipFiyat)}</div>
          <div class="lejant-oge"><span class="kutu kullanilamaz"></span> Kullanılamaz</div>
        </div>
      </div>
    </div>

    <!-- Büfe Menüsü Entegrasyonu (Porsiyonlu) -->
    <div class="bolum">
      <h2>{metin.bufeyeEkle}</h2>
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
              <p>{u.boyut ?? u.aciklama}{typeof u.stok === "number" ? ` · Stok: ${u.stok}` : ""}</p>

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
              {#if u.stok === 0}<span class="bufe-fiyat">Stokta yok</span>{/if}
              <button
                type="button"
                class="sayac-btn"
                onclick={() => bufeAzalt(u)}
                disabled={secim.adet <= 0}
                aria-label={metin.azalt}
              >
                −
              </button>
              <b class="adet-sayi">{secim.adet}</b>
              <button
                type="button"
                class="sayac-btn"
                onclick={() => bufeArtir(u)}
                aria-label={metin.artir}
                disabled={typeof u.stok === "number" && secim.adet >= u.stok}
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
        <span>{metin.biletOzeti(seciliKoltuklar.length, seciliKoltuklar.join(", "))}</span>
        <b>{tl(biletToplam)}</b>
      </div>
      {#if vipKoltukSayisi > 0}
        <div class="ozet-satir alt-detay">
          <span>Standart {standartKoltukSayisi} × {tl(standartFiyat)} · VIP {vipKoltukSayisi} × {tl(vipFiyat)}</span>
          <span>{metin.dinamikFiyat}</span>
        </div>
      {/if}
      {#if bufeToplam > 0}
        <div class="ozet-satir">
          <span>{metin.bufeSiparisleri}</span>
          <b>{tl(bufeToplam)}</b>
        </div>
      {/if}
      <div class="ozet-satir toplam-vurgu">
        <span>{metin.genelToplam}</span>
        <span class="toplam-rakam">{tl(genelToplam)}</span>
      </div>

      <button class="btn satin-al-btn" disabled={!aktifSeans || seciliKoltuklar.length === 0} onclick={sepeteEkleVeGit}>
        {metin.sepeteEkle} · {tl(genelToplam)}
      </button>
    </div>
  </div>
</div>
{/if}

<style>
  .detay-kapsayici {
    max-width: 1000px;
    margin-inline: auto;
    width: 100%;
  }

  .geri-don {
    display: inline-flex;
    align-items: center;
    gap: var(--durum-oge-araligi);
    margin: var(--durum-aralik) 18px 1rem;
    padding: var(--durum-dugme-dikey-bosluk) var(--durum-dugme-yatay-bosluk);
    border: var(--kart-kenar-genisligi) solid var(--kenar);
    border-radius: var(--kart-etiket-radius);
    background: var(--kart);
    color: var(--yazi);
    font-weight: 600;
  }

  .geri-don:focus-visible {
    outline: var(--kart-odak-genisligi) solid var(--kart-odak-rengi);
    outline-offset: var(--kart-odak-araligi);
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

  .bilet-turu-secici {
    display: flex;
    max-width: 280px;
    flex-direction: column;
    gap: 6px;
    margin: 0 0 12px;
    color: var(--yazi-soluk);
    font-size: 13px;
  }

  .bilet-turu-secici select {
    min-height: 40px;
    padding: 8px 10px;
    border: 1px solid var(--kenar);
    border-radius: 8px;
    background: var(--kart);
    color: var(--yazi);
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
    max-width: 100%;
    overflow-x: auto;
  }

  .sira-satir {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    min-width: max-content;
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
    min-width: max-content;
  }

  .koltuk-koridor {
    width: 24px;
    flex: 0 0 24px;
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

  .koltuk.kullanilamaz {
    background: var(--kenar);
    color: var(--yazi-soluk);
    cursor: not-allowed;
    opacity: 0.4;
  }

  .koltuk.dolu.kendi {
    border: 2px solid var(--renk-ana);
    background: color-mix(in srgb, var(--renk-ana) 30%, var(--kart));
    color: var(--yazi);
    opacity: 1;
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

  .kutu.kendi {
    border: 2px solid var(--renk-ana);
    background: color-mix(in srgb, var(--renk-ana) 30%, var(--kart));
  }

  .kutu.kullanilamaz {
    background: var(--kenar);
    opacity: 0.5;
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

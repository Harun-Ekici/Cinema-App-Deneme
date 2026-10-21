<script lang="ts">
  // CineQ Sepet & Ödeme Ekranı — Promosyon Kodu, Sahte Ödeme Simülasyonu ve Kalıcı Durum (Svelte 5 Runes)
  import { onMount } from "svelte";
  import { tl } from "$lib/data";
  import { sepet } from "$lib/sepet.svelte";
  import { biletlerim } from "$lib/biletler.svelte";

  onMount(() => {
    sepet.yenile();
  });

  let isleniyor = $state(false);
  let promoGirdi = $state("");
  let promoHata = $state("");
  let odemeYontemi = $state<"kart" | "hizli">("kart");

  // Sahte Kart Bilgileri
  let kartSahibi = $state("Harun Ekici");
  let kartNo = $state("4543 •••• •••• 1003");
  let kartSkt = $state("12/28");
  let kartCvv = $state("342");

  function indirimUygula() {
    promoHata = "";
    if (!promoGirdi.trim()) return;
    const basarili = sepet.indirimKoduUygula(promoGirdi);
    if (!basarili) {
      promoHata = "Geçersiz promosyon kodu! Deneyebileceğiniz kodlar: CINEQ10, OGRENCI20, ILKBILET";
    } else {
      promoGirdi = "";
    }
  }

  async function odemeTamamla() {
    if (sepet.kalemler.length === 0) return;
    isleniyor = true;
    try {
      // 1 saniyelik ödeme simülasyon gecikmesi
      await new Promise((r) => setTimeout(r, 1000));
      
      const indirimMetni = sepet.indirimKodu
        ? `${sepet.indirimKodu} (%${Math.round(sepet.indirimOrani * 100)} İndirim)`
        : undefined;

      await biletlerim.satinAl(sepet.biletler, sepet.bufeKalemleri, indirimMetni);
      sepet.temizle();

      if (typeof window !== "undefined") {
        window.location.href = "/biletlerim";
      }
    } finally {
      isleniyor = false;
    }
  }
</script>

<div class="sayfa sepet-sayfa">
  <div class="baslik-alani">
    <h1>Sepetim & Ödeme</h1>
    {#if sepet.adet > 0}
      <span class="adet-etiket">{sepet.adet} Kalem</span>
    {/if}
  </div>

  {#if sepet.biletler.length === 0 && sepet.bufeKalemleri.length === 0}
    <div class="kart bos-sepet">
      <span class="bos-ikon">🛒</span>
      <p class="bos-mesaj">Sepetinizde henüz bilet veya büfe siparişi bulunmuyor.</p>
      <a href="/" class="kesfet-link">Vizyondaki Filmleri Keşfet →</a>
    </div>
  {:else}
    <!-- 1. Bilet Kalemleri -->
    {#if sepet.biletler.length > 0}
      <div class="bolum">
        <h2>Sinema Biletleri</h2>
        <div class="kalem-listesi">
          {#each sepet.biletler as b, i}
            <div class="kart kalem-karti">
              <div class="kalem-detay">
                <span class="kalem-rozet">Bilet · {b.film.salonTipi}</span>
                <strong class="kalem-baslik">{b.film.baslik}</strong>
                <p class="kalem-alt">{b.salon} · Seans: <b>{b.seans}</b></p>
                <p class="koltuk-bilgi">
                  Koltuklar: <b>{b.koltuklar.join(", ")}</b> ({b.bilet.ad})
                  {#if b.vipKoltukSayisi > 0}
                    <span class="vip-rozet">✨ {b.vipKoltukSayisi}x VIP</span>
                  {/if}
                </p>
              </div>
              <div class="kalem-sag">
                <span class="tutar">{tl(b.toplamTutar)}</span>
                <button
                  type="button"
                  class="sil-btn"
                  onclick={() => sepet.silBilet(i)}
                  aria-label="Bileti sepetten sil"
                >
                  🗑️
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- 2. Büfe Siparişleri -->
    {#if sepet.bufeKalemleri.length > 0}
      <div class="bolum">
        <h2>Büfe Siparişleri</h2>
        <div class="kalem-listesi">
          {#each sepet.bufeKalemleri as bk, i}
            <div class="kart kalem-karti bufe">
              <span class="bufe-simge">{bk.urun.ikon}</span>
              <div class="kalem-detay">
                <strong class="kalem-baslik">{bk.urun.ad}</strong>
                <p class="kalem-alt">
                  {bk.adet} Adet
                  {#if bk.porsiyonAdi}· {bk.porsiyonAdi}{/if}
                  · Birim: {tl(bk.birimFiyat)}
                </p>
              </div>
              <div class="kalem-sag">
                <span class="tutar">{tl(bk.birimFiyat * bk.adet)}</span>
                <button
                  type="button"
                  class="sil-btn"
                  onclick={() => sepet.silBufe(i)}
                  aria-label="Ürünü sepetten sil"
                >
                  🗑️
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- 3. Promosyon & İndirim Kodu Alanı -->
    <div class="kart promo-karti">
      <h3>İndirim / Promosyon Kodu</h3>
      {#if sepet.indirimKodu}
        <div class="aktif-kod-satir">
          <span class="kod-rozet">✓ {sepet.indirimKodu} (%{Math.round(sepet.indirimOrani * 100)} İndirim)</span>
          <button type="button" class="kod-kaldir-btn" onclick={() => sepet.indirimKoduKaldir()}>
            Kaldır
          </button>
        </div>
      {:else}
        <div class="promo-girdi-satir">
          <input
            type="text"
            placeholder="Kupon Kodu (Örn: CINEQ10)"
            bind:value={promoGirdi}
            class="promo-input"
          />
          <button type="button" class="promo-uygula-btn" onclick={indirimUygula}>
            Uygula
          </button>
        </div>
        {#if promoHata}
          <p class="hata-metin">{promoHata}</p>
        {/if}
      {/if}
    </div>

    <!-- 4. Sahte Ödeme Yöntemi Seçimi -->
    <div class="kart odeme-yontemi-karti">
      <h3>Ödeme Yöntemi</h3>
      <div class="yontem-secenekleri">
        <label class="yontem-label" class:aktif={odemeYontemi === "kart"}>
          <input type="radio" name="odeme" value="kart" bind:group={odemeYontemi} />
          <span>💳 Kredi / Banka Kartı</span>
        </label>
        <label class="yontem-label" class:aktif={odemeYontemi === "hizli"}>
          <input type="radio" name="odeme" value="hizli" bind:group={odemeYontemi} />
          <span>⚡ CineQ Pay (Hızlı Ödeme)</span>
        </label>
      </div>

      {#if odemeYontemi === "kart"}
        <div class="sahte-kart-formu">
          <div class="form-alan">
            <span class="alan-baslik">Kart Üzerindeki İsim</span>
            <input type="text" bind:value={kartSahibi} class="form-input" />
          </div>
          <div class="form-alan">
            <span class="alan-baslik">Kart Numarası</span>
            <input type="text" bind:value={kartNo} class="form-input" />
          </div>
          <div class="form-cift-alan">
            <div class="form-alan">
              <span class="alan-baslik">SKT</span>
              <input type="text" bind:value={kartSkt} class="form-input" />
            </div>
            <div class="form-alan">
              <span class="alan-baslik">CVV</span>
              <input type="text" bind:value={kartCvv} class="form-input" />
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- 5. Genel Toplam ve Ödeme Butonu -->
    <div class="kart siparis-toplam-karti">
      <div class="satir">
        <span>Bilet Tutarı ({sepet.biletAdet} Adet)</span>
        <b>{tl(sepet.biletToplam)}</b>
      </div>
      {#if sepet.bufeToplam > 0}
        <div class="satir">
          <span>Büfe Tutarı ({sepet.bufeAdet} Adet)</span>
          <b>{tl(sepet.bufeToplam)}</b>
        </div>
      {/if}
      {#if sepet.indirimTutari > 0}
        <div class="satir indirim-satir">
          <span>Promosyon İndirimi ({sepet.indirimKodu})</span>
          <b class="indirim-tutar">−{tl(sepet.indirimTutari)}</b>
        </div>
      {/if}
      <div class="satir dip-toplam">
        <span>Ödenecek Toplam Tutar</span>
        <strong class="buyuk-fiyat">{tl(sepet.toplam)}</strong>
      </div>

      <button class="btn odeme-btn" onclick={odemeTamamla} disabled={isleniyor}>
        {#if isleniyor}
          <span>⏳ Güvenli Ödeme İşleniyor...</span>
        {:else}
          <span>{tl(sepet.toplam)} · Rezervasyonu ve Ödemeyi Tamamla</span>
        {/if}
      </button>
    </div>
  {/if}
</div>

<style>
  .sepet-sayfa {
    max-width: 800px;
    margin-inline: auto;
    width: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .baslik-alani {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    color: var(--yazi);
  }

  .adet-etiket {
    font-size: 13px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--zemin);
    border: 1px solid var(--kenar);
    color: var(--yazi-soluk);
  }

  .bolum h2 {
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: 700;
    color: var(--yazi);
  }

  .kalem-listesi {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .kalem-karti {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
  }

  .kalem-rozet {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--zemin);
    font-size: 11px;
    font-weight: 700;
    color: var(--renk-ana);
    margin-block-end: 4px;
  }

  .vip-rozet {
    font-size: 11px;
    font-weight: 700;
    color: var(--vip-renk);
    margin-inline-start: 6px;
  }

  .bufe-simge {
    font-size: 32px;
  }

  .kalem-detay {
    flex: 1;
  }

  .kalem-baslik {
    display: block;
    font-size: 15px;
    color: var(--yazi);
    line-height: 1.3;
  }

  .kalem-alt {
    margin: 2px 0;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .koltuk-bilgi {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--yazi);
  }

  .kalem-sag {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .tutar {
    font-size: 15px;
    font-weight: 700;
    color: var(--yazi);
  }

  .sil-btn {
    background: transparent;
    border: none;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
  }

  .sil-btn:hover {
    background: var(--zemin);
  }

  /* Promosyon Kartı */
  .promo-karti {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .promo-karti h3 {
    margin: 0;
    font-size: 15px;
    color: var(--yazi);
  }

  .promo-girdi-satir {
    display: flex;
    gap: 10px;
  }

  .promo-input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--zemin);
    color: var(--yazi);
    font-size: 14px;
  }

  .promo-uygula-btn {
    padding: 10px 18px;
    border: 1px solid var(--renk-ana);
    border-radius: var(--radius);
    background: var(--renk-ana);
    color: var(--header-yazi);
    font-weight: 600;
    cursor: pointer;
  }

  .aktif-kod-satir {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 8px;
    background: var(--zemin);
    border: 1px solid var(--basari);
  }

  .kod-rozet {
    font-size: 13px;
    font-weight: 700;
    color: var(--basari);
  }

  .kod-kaldir-btn {
    background: transparent;
    border: none;
    color: var(--tehlike);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .hata-metin {
    margin: 0;
    font-size: 12px;
    color: var(--tehlike);
  }

  /* Sahte Ödeme Formu */
  .odeme-yontemi-karti {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .odeme-yontemi-karti h3 {
    margin: 0;
    font-size: 15px;
    color: var(--yazi);
  }

  .yontem-secenekleri {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .yontem-label {
    flex: 1;
    min-width: 180px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: var(--yazi);
  }

  .yontem-label.aktif {
    border-color: var(--renk-ana);
    background: var(--zemin);
  }

  .sahte-kart-formu {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: 10px;
    background: var(--zemin);
    border: 1px solid var(--kenar);
  }

  .form-alan {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .alan-baslik {
    font-size: 11px;
    font-weight: 600;
    color: var(--yazi-soluk);
  }

  .form-input {
    padding: 8px 12px;
    border: 1px solid var(--kenar);
    border-radius: 8px;
    background: var(--kart);
    color: var(--yazi);
    font-size: 13px;
  }

  .form-cift-alan {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .bos-sepet {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 16px;
    text-align: center;
    gap: 12px;
  }

  .bos-ikon {
    font-size: 42px;
  }

  .bos-mesaj {
    margin: 0;
    font-size: 15px;
    color: var(--yazi-soluk);
  }

  .kesfet-link {
    color: var(--renk-ana);
    font-weight: 700;
    font-size: 14px;
    text-decoration: underline;
  }

  .siparis-toplam-karti {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .satir {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: var(--yazi);
  }

  .satir.indirim-satir {
    color: var(--basari);
    font-weight: 600;
  }

  .indirim-tutar {
    color: var(--basari);
  }

  .satir.dip-toplam {
    padding-block-start: 10px;
    border-block-start: 1px dashed var(--kenar);
    font-size: 16px;
    font-weight: 700;
  }

  .buyuk-fiyat {
    font-size: 20px;
    color: var(--renk-ana);
  }

  .odeme-btn {
    margin-block-start: 8px;
    cursor: pointer;
  }
</style>

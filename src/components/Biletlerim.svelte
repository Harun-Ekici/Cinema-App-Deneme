<script lang="ts">
  // CineQ Biletlerim Ekranı — Dijital Perforasyonlu Bilet, Barkod/QR ve Paylaşım (Svelte 5 Runes)
  import { onMount } from "svelte";
  import { biletlerim, type BiletKaydi } from "$lib/biletler.svelte";
  import { tl } from "$lib/data";

  onMount(() => {
    biletlerim.yenile();
  });

  let kopyalandiKod = $state<string | null>(null);

  async function biletiPaylas(b: BiletKaydi) {
    const metin = [
      `🎬 CineQ Sinema Bileti`,
      `Film: ${b.baslik}`,
      `Salon: ${b.salon}`,
      `Seans: ${b.seans}`,
      `Koltuklar: ${b.koltuklar ? b.koltuklar.join(", ") : "Standart"}`,
      `PNR Kodu: ${b.kod}`,
      b.bufeOzet ? `Büfe: ${b.bufeOzet}` : null,
      b.indirimBilgi ? `İndirim: ${b.indirimBilgi}` : null,
      `Toplam: ${tl(b.toplamTutar)}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(metin);
        kopyalandiKod = b.kod;
        setTimeout(() => {
          kopyalandiKod = null;
        }, 2500);
      }
    } catch {
      // Hata durumunda sessizce geç
    }
  }
</script>

<div class="sayfa biletlerim-sayfa">
  <div class="baslik-alani">
    <h1>Biletlerim & Rezervasyonlarım</h1>
    {#if biletlerim.liste.length > 0}
      <span class="adet-etiket">{biletlerim.liste.length} Bilet</span>
    {/if}
  </div>

  {#each biletlerim.liste as b (b.kod)}
    <div class="kart bilet-karti">
      <!-- Bilet Üst Kupon Bölümü -->
      <div class="bilet-ust">
        <div class="bilet-baslik-satir">
          <span class="sinema-rozet">CineQ Dijital Bilet</span>
          <span class="tarih-bilgi">{new Date(b.tarih).toLocaleDateString("tr-TR")}</span>
        </div>

        <h2 class="film-ad">{b.baslik}</h2>
        <p class="salon-seans">{b.salon} · Seans: <b>{b.seans}</b></p>

        <div class="koltuk-satir">
          <span>Koltuklar:</span>
          <b class="koltuk-vurgu">{b.koltuklar ? b.koltuklar.join(", ") : "Standart"}</b>
          <span class="kategori-not">({b.kategori})</span>
          {#if b.vipKoltukSayisi && b.vipKoltukSayisi > 0}
            <span class="vip-rozet">✨ {b.vipKoltukSayisi}x VIP</span>
          {/if}
        </div>

        {#if b.bufeOzet}
          <div class="bufe-ozet-satir">
            <span class="bufe-etiket">🍿 Büfe:</span>
            <span>{b.bufeOzet}</span>
          </div>
        {/if}

        {#if b.indirimBilgi}
          <div class="indirim-ozet-satir">
            <span>🏷️ {b.indirimBilgi}</span>
          </div>
        {/if}
      </div>

      <!-- Delikli Yırtma Çizgisi (Perforasyon) -->
      <div class="perforasyon-ayrac">
        <span class="centik sol"></span>
        <span class="kesik-cizgi"></span>
        <span class="centik sag"></span>
      </div>

      <!-- Bilet Alt Barkod, QR ve PNR Şeridi -->
      <div class="bilet-alt">
        <div class="barkod-ve-qr">
          <!-- Sahte SVG QR Kodu Görseli -->
          <div class="qr-kutu" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <line x1="7" y1="7" x2="7" y2="7"></line>
              <line x1="17" y1="7" x2="17" y2="7"></line>
              <line x1="7" y1="17" x2="7" y2="17"></line>
              <line x1="17" y1="17" x2="17" y2="17"></line>
            </svg>
          </div>

          <div class="kod-bilgi">
            <span class="kod-etiket">DOĞRULAMA KODU (PNR)</span>
            <code class="bilet-kod">{b.kod}</code>
            <!-- Barkod Çizgileri -->
            <div class="barkod-cizgiler" aria-hidden="true">
              <span class="cizgi c1"></span>
              <span class="cizgi c2"></span>
              <span class="cizgi c3"></span>
              <span class="cizgi c1"></span>
              <span class="cizgi c2"></span>
              <span class="cizgi c4"></span>
              <span class="cizgi c2"></span>
              <span class="cizgi c1"></span>
              <span class="cizgi c3"></span>
              <span class="cizgi c2"></span>
            </div>
          </div>
        </div>

        <div class="aksiyon-alani">
          {#if b.toplamTutar}
            <span class="fiyat-etiket">{tl(b.toplamTutar)}</span>
          {/if}
          <button
            type="button"
            class="paylas-btn"
            onclick={() => biletiPaylas(b)}
            aria-label="Bileti paylaş veya kopyala"
          >
            {#if kopyalandiKod === b.kod}
              <span>✓ Kopyalandı!</span>
            {:else}
              <span>📋 Paylaş / Kopyala</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  {:else}
    <div class="kart bos-bilet">
      <span class="bos-ikon">🎟️</span>
      <p class="bos-mesaj">Henüz aktif veya geçmiş bir sinema biletiniz bulunmuyor.</p>
      <a href="/" class="kesfet-link">Vizyondaki Filmlere Göz Atın →</a>
    </div>
  {/each}
</div>

<style>
  .biletlerim-sayfa {
    max-width: 800px;
    margin-inline: auto;
    width: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .baslik-alani {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    margin: 0;
    font-size: 22px;
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

  .bilet-karti {
    overflow: hidden;
    position: relative;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    box-shadow: 0 4px 14px var(--kenar);
  }

  .bilet-ust {
    padding: 18px;
    border-inline-start: 6px solid var(--renk-ana);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .bilet-baslik-satir {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sinema-rozet {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    background: var(--renk-ana);
    color: var(--header-yazi);
  }

  .tarih-bilgi {
    font-size: 12px;
    color: var(--yazi-soluk);
  }

  .film-ad {
    margin: 4px 0 0;
    font-size: 19px;
    font-weight: 800;
    color: var(--yazi);
  }

  .salon-seans {
    margin: 0;
    font-size: 14px;
    color: var(--yazi-soluk);
  }

  .koltuk-satir {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--yazi);
    margin-block-start: 4px;
  }

  .koltuk-vurgu {
    color: var(--renk-ana);
    font-weight: 800;
  }

  .kategori-not {
    font-size: 12px;
    color: var(--yazi-soluk);
  }

  .vip-rozet {
    font-size: 11px;
    font-weight: 700;
    color: var(--vip-renk);
    background: var(--zemin);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--kenar);
  }

  .bufe-ozet-satir {
    margin-block-start: 4px;
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--zemin);
    font-size: 12px;
    color: var(--yazi);
    display: flex;
    gap: 6px;
  }

  .bufe-etiket {
    font-weight: 700;
    color: var(--renk-vurgu);
  }

  .indirim-ozet-satir {
    font-size: 12px;
    font-weight: 600;
    color: var(--basari);
  }

  /* Perforasyon / Delikli Ayrım Çizgisi */
  .perforasyon-ayrac {
    position: relative;
    height: 20px;
    display: flex;
    align-items: center;
    margin: 0 -1px;
  }

  .centik {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--zemin);
    border: 1px solid var(--kenar);
    position: absolute;
    top: 0;
    z-index: 2;
  }

  .centik.sol {
    inset-inline-start: -10px;
  }

  .centik.sag {
    inset-inline-end: -10px;
  }

  .kesik-cizgi {
    width: 100%;
    border-top: 2px dashed var(--kenar);
  }

  /* Alt Bilet / Barkod ve QR Şeridi */
  .bilet-alt {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background: var(--kart);
    gap: 12px;
    flex-wrap: wrap;
  }

  .barkod-ve-qr {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .qr-kutu {
    color: var(--yazi);
    opacity: 0.85;
    padding: 4px;
    border: 1px solid var(--kenar);
    border-radius: 8px;
    background: var(--zemin);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .kod-bilgi {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .kod-etiket {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--yazi-soluk);
  }

  .bilet-kod {
    font-size: 17px;
    font-weight: 800;
    color: var(--yazi);
    letter-spacing: 1.5px;
  }

  .barkod-cizgiler {
    display: flex;
    gap: 2px;
    height: 14px;
    margin-block-start: 4px;
    opacity: 0.6;
  }

  .cizgi {
    background: var(--yazi);
    border-radius: 1px;
  }

  .c1 { width: 2px; }
  .c2 { width: 4px; }
  .c3 { width: 1px; }
  .c4 { width: 6px; }

  .aksiyon-alani {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    margin-inline-start: auto;
  }

  .fiyat-etiket {
    font-size: 16px;
    font-weight: 800;
    color: var(--renk-ana);
  }

  .paylas-btn {
    padding: 8px 14px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--zemin);
    color: var(--yazi);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .paylas-btn:hover {
    border-color: var(--renk-ana);
    color: var(--renk-ana);
  }

  .bos-bilet {
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
</style>

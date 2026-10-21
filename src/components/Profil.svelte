<script lang="ts">
  // CineQ Profil ve Ayarlar — Tema Yönetimi ve Kullanıcı Bilgisi (Svelte 5 Runes)
  import { biletlerim } from "$lib/biletler.svelte";
  import { tema, temaListesi, type TemaModu } from "$lib/tema.svelte";

  let kullanici = $state(
    typeof localStorage !== "undefined"
      ? (localStorage.getItem("kullanici") ?? "")
      : ""
  );
  let ad = $state("");
  let eposta = $state("");

  const gecerli = $derived(ad.trim().length > 1 && eposta.includes("@"));

  function girisYap(event: SubmitEvent) {
    event.preventDefault();
    kullanici = ad.trim();
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("kullanici", kullanici);
    }
  }

  function cikisYap() {
    kullanici = "";
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("kullanici");
    }
  }
</script>

<div class="sayfa profil-sayfa">
  <h1>Profil & Ayarlar</h1>

  <!-- 1. Kullanıcı Profili veya Giriş Formu -->
  {#if kullanici}
    <div class="kart profil-karti">
      <div class="avatar">{kullanici[0].toLocaleUpperCase("tr")}</div>
      <h2>Merhaba, {kullanici}</h2>
      <p class="bilet-sayac">{biletlerim.liste.length} adet aktif veya geçmiş biletiniz var</p>
      <div class="profil-butonlar">
        <a class="btn" href="/biletlerim">Biletlerimi Görüntüle</a>
        <button class="btn ikincil-btn" onclick={cikisYap}>Oturumu Kapat</button>
      </div>
    </div>
  {:else}
    <div class="kart giris-karti">
      <h2>Hızlı Giriş Yap</h2>
      <p class="giris-aciklama">Biletlerinizi ve rezervasyon geçmişinizi senkronize etmek için giriş yapın.</p>
      <form class="form" onsubmit={girisYap}>
        <label>
          <span>Ad Soyad</span>
          <input bind:value={ad} placeholder="Harun Ekici" />
        </label>
        <label>
          <span>E-posta</span>
          <input type="email" bind:value={eposta} placeholder="harun@cineq.app" />
        </label>
        <button class="btn" disabled={!gecerli}>Giriş Yap</button>
      </form>
    </div>
  {/if}

  <!-- 2. Gelişmiş Tema & Görünüm Ayarları -->
  <div class="kart ayarlar-karti">
    <div class="kart-baslik-satir">
      <span class="kart-ikon">🎨</span>
      <div>
        <h3>Görünüm & Tema Seçimi</h3>
        <p class="ayar-aciklama">CineQ arayüzünü tarzınıza göre kişiselleştirin.</p>
      </div>
    </div>

    <div class="tema-secenekler-grid">
      {#each temaListesi as t}
        <button
          type="button"
          class="tema-kart-secenek"
          class:aktif={tema.secili === t.id}
          onclick={() => tema.ayarla(t.id)}
        >
          <div class="tema-ust-satir">
            <span class="tema-emoji">{t.ikon}</span>
            <span class="tema-baslik">{t.baslik}</span>
            {#if tema.secili === t.id}
              <span class="aktif-isaret">✓</span>
            {/if}
          </div>
          <p class="tema-detay">{t.aciklama}</p>
        </button>
      {/each}
    </div>
  </div>

  <!-- 3. Kurumsal & Bilgi Bağlantıları -->
  <div class="kart bilgi-karti">
    <div class="kart-baslik-satir">
      <span class="kart-ikon">ℹ️</span>
      <div>
        <h3>Kurumsal & Destek</h3>
        <p class="ayar-aciklama">CineQ hakkında yasal bildirimler ve iletişim.</p>
      </div>
    </div>

    <div class="bilgi-linkleri">
      <a href="/hakkinda" class="bilgi-link">
        <span>📖 Hakkında & Teknoloji Rehberi</span>
        <span class="ok">→</span>
      </a>
      <a href="/iletisim" class="bilgi-link">
        <span>📬 İletişim & Geri Bildirim</span>
        <span class="ok">→</span>
      </a>
      <a href="/kosullar" class="bilgi-link">
        <span>📜 Hizmet ve Kullanım Koşulları</span>
        <span class="ok">→</span>
      </a>
      <a href="/gizlilik" class="bilgi-link">
        <span>🔒 Gizlilik Politikası & KVKK</span>
        <span class="ok">→</span>
      </a>
    </div>
  </div>
</div>

<style>
  .profil-sayfa {
    max-width: 800px;
    margin-inline: auto;
    width: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    color: var(--yazi);
  }

  /* Profil Kartı */
  .profil-karti {
    padding: 24px 16px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .avatar {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: var(--renk-ana);
    color: var(--header-yazi);
    font-size: 28px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-block-end: 4px;
  }

  .profil-karti h2 {
    margin: 0;
    font-size: 20px;
    color: var(--yazi);
  }

  .bilet-sayac {
    margin: 0 0 12px;
    font-size: 14px;
    color: var(--yazi-soluk);
  }

  .profil-butonlar {
    display: flex;
    gap: 10px;
    width: 100%;
    max-width: 380px;
  }

  .ikincil-btn {
    background: var(--zemin);
    color: var(--yazi);
    border: 1px solid var(--kenar);
  }

  /* Giriş Formu */
  .giris-karti {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .giris-karti h2 {
    margin: 0;
    font-size: 18px;
    color: var(--yazi);
  }

  .giris-aciklama {
    margin: 0;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-block-start: 6px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--yazi);
  }

  input {
    padding: 10px 14px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--zemin);
    color: var(--yazi);
    font-size: 14px;
  }

  /* Ayarlar & Tema Kartı */
  .ayarlar-karti,
  .bilgi-karti {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .kart-baslik-satir {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .kart-ikon {
    font-size: 24px;
  }

  .kart-baslik-satir h3 {
    margin: 0;
    font-size: 16px;
    color: var(--yazi);
  }

  .ayar-aciklama {
    margin: 2px 0 0;
    font-size: 13px;
    color: var(--yazi-soluk);
  }

  .tema-secenekler-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  @media (min-width: 600px) {
    .tema-secenekler-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .tema-kart-secenek {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--zemin);
    color: var(--yazi);
    cursor: pointer;
    text-align: start;
    transition: all 0.15s ease;
  }

  .tema-kart-secenek:hover {
    border-color: var(--renk-ana);
  }

  .tema-kart-secenek.aktif {
    border-color: var(--renk-ana);
    background: var(--kart);
    box-shadow: 0 0 0 2px var(--renk-ana);
  }

  .tema-ust-satir {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tema-emoji {
    font-size: 18px;
  }

  .tema-baslik {
    font-size: 14px;
    font-weight: 700;
    flex: 1;
  }

  .aktif-isaret {
    font-size: 14px;
    font-weight: 800;
    color: var(--renk-ana);
  }

  .tema-detay {
    margin: 0;
    font-size: 12px;
    color: var(--yazi-soluk);
    line-height: 1.4;
  }

  /* Bilgi Linkleri */
  .bilgi-linkleri {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bilgi-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border: 1px solid var(--kenar);
    border-radius: var(--radius);
    background: var(--zemin);
    color: var(--yazi);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.15s ease;
  }

  .bilgi-link:hover {
    border-color: var(--renk-ana);
    color: var(--renk-ana);
  }

  .ok {
    font-size: 14px;
    color: var(--yazi-soluk);
  }
</style>

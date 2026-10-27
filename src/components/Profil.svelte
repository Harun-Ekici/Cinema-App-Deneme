<script lang="ts">
  // CineQ Profil ve Ayarlar — Tema Yönetimi ve Kullanıcı Bilgisi (Svelte 5 Runes)
  import { onMount } from "svelte";
  import { biletlerim } from "$lib/biletler.svelte";
  import { tema, temaListesi, type TemaModu } from "$lib/tema.svelte";
  import {
    authLogin,
    authLogout,
    authMe,
    authOwnerSetupRequired,
    authSetOwnerInitialPassword,
    isTauriRuntime,
    OWNER_ACCOUNT_EMAIL,
    type AdminAuthSession,
  } from "../admin/data/tauriAdapter";

  const tauri = isTauriRuntime();
  let kullanici = $state(
    !tauri && typeof localStorage !== "undefined"
      ? (localStorage.getItem("kullanici") ?? "")
      : ""
  );
  let ad = $state("");
  let eposta = $state("");
  let parola = $state("");
  let parolaTekrar = $state("");
  let authSession = $state<AdminAuthSession | null>(null);
  let adminYetkili = $state(false);
  let ownerKurulumuGerekli = $state(false);
  let authYukleniyor = $state(false);
  let authGonderiliyor = $state(false);
  let authHatasi = $state("");
  let yetkiKontrolHatasi = $state("");

  const profilAdi = $derived(tauri ? authSession?.user.name ?? "" : kullanici);
  const gecerli = $derived(
    tauri
      ? eposta.includes("@") && parola.length > 0 &&
        (!ownerKurulumuGerekli || parola === parolaTekrar)
      : ad.trim().length > 1 && eposta.includes("@")
  );

  onMount(async () => {
    if (!tauri) return;
    authYukleniyor = true;
    try {
      const [session, setupRequired] = await Promise.all([authMe(), authOwnerSetupRequired()]);
      authSession = session;
      ownerKurulumuGerekli = setupRequired;
      adminYetkili = session?.roles.some((role) => role.toLocaleLowerCase("tr") === "admin" || role.toLocaleLowerCase("tr") === "owner") ?? false;
      if (setupRequired) eposta = OWNER_ACCOUNT_EMAIL;
    } catch (error) {
      yetkiKontrolHatasi = error instanceof Error ? error.message : "Yönetici yetkisi doğrulanamadı.";
      console.error("Profilde yönetici rolü doğrulanamadı.", error);
    } finally {
      authYukleniyor = false;
    }
  });

  async function girisYap(event: SubmitEvent) {
    event.preventDefault();
    authHatasi = "";
    if (tauri) {
      authGonderiliyor = true;
      try {
        const ownerKurulumunuYapiyor = ownerKurulumuGerekli && eposta.trim().toLocaleLowerCase("en") === OWNER_ACCOUNT_EMAIL;
        const session = ownerKurulumunuYapiyor
          ? await authSetOwnerInitialPassword(parola)
          : await authLogin(eposta, parola);
        authSession = session;
        adminYetkili = session.roles.some((role) => role.toLocaleLowerCase("tr") === "admin" || role.toLocaleLowerCase("tr") === "owner");
        if (ownerKurulumunuYapiyor) ownerKurulumuGerekli = false;
        parola = "";
        parolaTekrar = "";
      } catch (error) {
        authHatasi = error instanceof Error ? error.message : "Oturum açılamadı.";
      } finally {
        authGonderiliyor = false;
      }
      return;
    }

    kullanici = ad.trim();
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("kullanici", kullanici);
    }
  }

  async function cikisYap() {
    if (tauri) {
      try {
        await authLogout();
        authSession = null;
        adminYetkili = false;
        parola = "";
        parolaTekrar = "";
        authHatasi = "";
      } catch (error) {
        authHatasi = error instanceof Error ? error.message : "Oturum kapatılamadı.";
      }
      return;
    }
    kullanici = "";
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("kullanici");
    }
  }
</script>

<div class="sayfa profil-sayfa">
  <h1>Profil & Ayarlar</h1>

  <!-- 1. Kullanıcı Profili veya Giriş Formu -->
  {#if profilAdi}
    <div class="kart profil-karti">
      <div class="avatar">{profilAdi[0].toLocaleUpperCase("tr")}</div>
      <h2>Merhaba, {profilAdi}</h2>
      <p class="bilet-sayac">{biletlerim.liste.length} adet aktif veya geçmiş biletiniz var</p>
      {#if yetkiKontrolHatasi}
        <p class="profil-yetki-hatasi" role="status">Yönetim paneli erişimi doğrulanamadı.</p>
      {/if}
      {#if authHatasi}
        <p class="profil-yetki-hatasi" role="alert">{authHatasi}</p>
      {/if}
      <div class="profil-butonlar">
        <a class="btn" href="/biletlerim">Biletlerimi Görüntüle</a>
        {#if adminYetkili}
          <a class="btn ikincil-btn" href="/admin">Yönetim Paneline Git</a>
        {/if}
        <button class="btn ikincil-btn" onclick={cikisYap}>Oturumu Kapat</button>
      </div>
    </div>
  {:else}
    <div class="kart giris-karti">
      <h2>{ownerKurulumuGerekli ? "Owner İlk Parola Kurulumu" : "Hızlı Giriş Yap"}</h2>
      <p class="giris-aciklama">
        {#if tauri}
          {ownerKurulumuGerekli ? `${OWNER_ACCOUNT_EMAIL} hesabı için ilk parolanızı belirleyin.` : "Profilinizi ve yönetim izinlerinizi doğrulamak için e-posta ve parolanızla giriş yapın."}
        {:else}
          Biletlerinizi ve rezervasyon geçmişinizi senkronize etmek için giriş yapın.
        {/if}
      </p>
      {#if authYukleniyor}
        <p class="giris-aciklama" role="status">Oturum denetleniyor...</p>
      {:else}
      <form class="form" onsubmit={girisYap}>
        {#if !tauri}
          <label>
            <span>Ad Soyad</span>
            <input bind:value={ad} placeholder="Adınız Soyadınız" required />
          </label>
        {/if}
        <label>
          <span>E-posta</span>
          <input type="email" bind:value={eposta} placeholder="ornek@cineq.app" required readonly={tauri && ownerKurulumuGerekli} autocomplete="username" />
        </label>
        {#if tauri}
          <label>
            <span>{ownerKurulumuGerekli ? "Yeni Parola" : "Parola"}</span>
            <input type="password" bind:value={parola} required minlength={ownerKurulumuGerekli ? 8 : undefined} maxlength="128" autocomplete={ownerKurulumuGerekli ? "new-password" : "current-password"} />
          </label>
          {#if ownerKurulumuGerekli}
            <label>
              <span>Yeni Parola (Tekrar)</span>
              <input type="password" bind:value={parolaTekrar} required minlength="8" maxlength="128" autocomplete="new-password" />
            </label>
          {/if}
        {/if}
        {#if authHatasi}
          <p class="profil-yetki-hatasi" role="alert">{authHatasi}</p>
        {/if}
        {#if yetkiKontrolHatasi}
          <p class="profil-yetki-hatasi" role="alert">Oturum doğrulanamadı: {yetkiKontrolHatasi}</p>
        {/if}
        <button class="btn" disabled={!gecerli || authYukleniyor || authGonderiliyor}>
          {authGonderiliyor ? "Doğrulanıyor..." : ownerKurulumuGerekli ? "Parolayı Oluştur" : "Giriş Yap"}
        </button>
      </form>
      {/if}
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

  .profil-yetki-hatasi {
    margin: 0;
    color: var(--yazi-soluk);
    font-size: 13px;
  }

  .profil-butonlar {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
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

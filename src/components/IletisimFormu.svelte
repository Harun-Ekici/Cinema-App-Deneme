<script>
  let isim = $state('');
  let eposta = $state('');
  let konu = $state('');
  let mesaj = $state('');
  let gonderildi = $state(false);

  function formGonder(e) {
    e.preventDefault();
    if (!isim || !eposta || !mesaj) return;
    
    gonderildi = true;
    isim = '';
    eposta = '';
    konu = '';
    mesaj = '';

    setTimeout(() => {
      gonderildi = false;
    }, 4000);
  }
</script>

<div class="iletisim-kutu">
  {#if gonderildi}
    <div class="bildirim-basari">
      ✅ Mesajınız başarıyla iletildi! En kısa sürede dönüş yapılacaktır.
    </div>
  {/if}

  <form onsubmit={formGonder} class="form-alan">
    <div class="alan">
      <label for="isim">Ad Soyad</label>
      <input id="isim" type="text" bind:value={isim} required placeholder="Örn: Harun Ekici" />
    </div>

    <div class="alan">
      <label for="eposta">E-posta</label>
      <input id="eposta" type="email" bind:value={eposta} required placeholder="ornek@mail.com" />
    </div>

    <div class="alan">
      <label for="konu">Konu</label>
      <input id="konu" type="text" bind:value={konu} placeholder="Bilet / Büfe / Geri Bildirim" />
    </div>

    <div class="alan">
      <label for="mesaj">Mesajınız</label>
      <textarea id="mesaj" bind:value={mesaj} rows="4" required placeholder="Mesajınızı buraya yazın..."></textarea>
    </div>

    <button type="submit" class="gonder-btn">Mesajı Gönder</button>
  </form>
</div>

<style>
  .iletisim-kutu {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .bildirim-basari {
    background-color: #10b98120;
    color: #059669;
    border: 1px solid #10b981;
    padding: 12px;
    border-radius: var(--radius, 14px);
    font-weight: 500;
  }
  .form-alan {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .alan {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  label {
    font-size: 13px;
    color: var(--yazi-soluk);
  }
  input, textarea {
    background: var(--zemin);
    border: 1px solid var(--kenar);
    color: var(--yazi);
    padding: 10px 12px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
  }
  input:focus, textarea:focus {
    outline: none;
    border-color: var(--renk-ana);
  }
  .gonder-btn {
    background: var(--renk-ana);
    color: #ffffff;
    border: none;
    padding: 12px;
    border-radius: var(--radius, 14px);
    font-weight: 600;
    cursor: pointer;
    margin-top: 8px;
    transition: opacity 0.2s;
  }
  .gonder-btn:hover {
    opacity: 0.9;
  }
</style>
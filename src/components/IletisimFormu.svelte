<script>
  // Form metinleri sayfanın diline göre seçilir (/iletisim, /en/iletisim, /ar/iletisim, /fa/iletisim)
  const metinler = {
    tr: { isim: 'Ad Soyad', eposta: 'E-posta', konu: 'Konu', mesaj: 'Mesajınız', gonder: 'Mesajı Gönder', tamam: 'Mesajınız başarıyla iletildi! En kısa sürede dönüş yapılacaktır.', isimOrnek: 'Örn: Harun Ekici', konuOrnek: 'Bilet / Büfe / Geri Bildirim', mesajOrnek: 'Mesajınızı buraya yazın...' },
    en: { isim: 'Full name', eposta: 'Email', konu: 'Subject', mesaj: 'Your message', gonder: 'Send message', tamam: 'Your message has been sent. We will get back to you soon.', isimOrnek: 'e.g. Harun Ekici', konuOrnek: 'Ticket / Snack bar / Feedback', mesajOrnek: 'Write your message here...' },
    ar: { isim: 'الاسم الكامل', eposta: 'البريد الإلكتروني', konu: 'الموضوع', mesaj: 'رسالتك', gonder: 'إرسال الرسالة', tamam: 'تم إرسال رسالتك بنجاح. سنرد عليك في أقرب وقت.', isimOrnek: 'مثال: Harun Ekici', konuOrnek: 'تذكرة / مقصف / ملاحظات', mesajOrnek: 'اكتب رسالتك هنا...' },
    fa: { isim: 'نام و نام خانوادگی', eposta: 'ایمیل', konu: 'موضوع', mesaj: 'پیام شما', gonder: 'ارسال پیام', tamam: 'پیام شما با موفقیت ارسال شد. به‌زودی پاسخ می‌دهیم.', isimOrnek: 'مثال: Harun Ekici', konuOrnek: 'بلیت / بوفه / بازخورد', mesajOrnek: 'پیام خود را اینجا بنویسید...' },
  };
  let { dil = 'tr' } = $props();
  const m = $derived(metinler[dil] ?? metinler.tr);

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
    <div class="bildirim-basari" role="status">
      ✅ {m.tamam}
    </div>
  {/if}

  <form onsubmit={formGonder} class="form-alan">
    <div class="alan">
      <label for="isim">{m.isim}</label>
      <input id="isim" type="text" bind:value={isim} required placeholder={m.isimOrnek} />
    </div>

    <div class="alan">
      <label for="eposta">{m.eposta}</label>
      <input id="eposta" type="email" bind:value={eposta} required placeholder="ornek@mail.com" />
    </div>

    <div class="alan">
      <label for="konu">{m.konu}</label>
      <input id="konu" type="text" bind:value={konu} placeholder={m.konuOrnek} />
    </div>

    <div class="alan">
      <label for="mesaj">{m.mesaj}</label>
      <textarea id="mesaj" bind:value={mesaj} rows="4" required placeholder={m.mesajOrnek}></textarea>
    </div>

    <button type="submit" class="gonder-btn">{m.gonder}</button>
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
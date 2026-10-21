# Görev 15 — Rust Komutu: Tipli Sonuç ve Hata

## Araç ve model

Copilot SDK in VS Code; kullanılan model bilgisi oturum arayüzünde belirtilmiyor.

## İstem

Bu repoda Görev 15 (Rust Komutu: Tipli Sonuç ve Hata) çalışmasını yapacağız. Projemiz CineQ: Svelte 5, Astro ve Rust (Tauri) tabanlı bir sinema ve büfe rezervasyon/sipariş masaüstü uygulamasıdır.

AGENTS.md çalışma döngüsü kuralı gereğince ÖNCE SADECE PLANINI SUN, BEN ONAYLAYINCA DEĞİŞİKLİKLERİ UYGULA.

Gereksinimler ve Yapılacaklar:
1. `docs/tasks/week-4/15-rust-komutu.task.md` şartnamesine tam uyum sağla.
2. Rust tarafında şablon örneklerini temizle, CineQ'ya özgü tipli bilet PNR komutu, tipli hata ve en az iki birim testi uygula; geçersiz girdide panik/unwrap olmasın.
3. Tüm Tauri çağrılarını `src/lib/native.ts` üzerinden geçir; tarayıcı yedeği, `platform()` ve `destekleniyorMu(...)` ekle.
4. Rust girdi/çıktı/hata tiplerini `src/lib/types/` altında eşleştir ve bilet satın alma arayüzünde sonucu/hataları göster.
5. Platform matrisi ve Rust komut dokümantasyonunu oluştur, `AGENTS.md` indeksini ve platform kuralını güncelle.
6. `docs/istemler/15-rust-komutu.md` görev günlüğünü oluştur.
7. `cargo test`, `bun run check` ve `bun run build` komutlarını çalıştır.

Önce repodaki mevcut Tauri komut durumunu, kullanılacak veri akışını ve planını listele; onay olmadan dosyalarda değişiklik yapma. Planı incele, eksik varsa izin isteyerek ekle.

## Plan

Önce mevcut `bilet_olustur` Rust komutunu, doğrudan Tauri çağrısını ve ödeme/bilet oluşturma akışını inceledim. Kullanıcı planı onayladı; tarayıcı davranışı için deterministik demo PNR tercih edildi. Kabul edilen plan:

- Komutu `bilet_hesapla` ile tipli girdi/sonuç/hata sözleşmesine dönüştürmek ve hatalı girdiler için Rust testleri eklemek.
- Tipleri `src/lib/types/native.ts` altında tanımlamak; tek Tauri köprüsünü `src/lib/native.ts` yapmak.
- Çağrı hatalarını sessiz yedeğe düşürmemek; Sepet ekranında başarı özetini veya `HataDurumu` ve tekrar deneme eylemini göstermek.
- Platform/komut belgelerini, `AGENTS.md` indeksini ve bu günlüğü güncellemek.
- Rust testleri, Astro kontrolü, derleme ve Tauri çağrısı araması yapmak.

## Düzeltmeler

Başlangıçta mevcut Rust komutu opsiyonel salon/seans girdileriyle düz `String` döndürüyor ve zaman hesabında `unwrap()` kullanıyordu. Arayüzde çağrı hatası sessizce rastgele PNR'a düşüyordu. Uygulamada `greet` örnek komutu yok; kayıtlı diğer backend komutları korunmuştur.

## Doğrulama sonucu

- `Set-Location src-tauri; cargo test` — geçti: 7 test başarılı, 0 başarısız. İlk deneme repo kökünden yapıldığı için `Cargo.toml` bulunamadı; doğru çalışma dizininde yeniden çalıştırıldı.
- `bun run check` — geçti: 0 hata, 0 uyarı. Projedeki mevcut `CanliRozet.tsx` kullanılmayan React importu için 1 hint gösteriyor.
- `bun run build` — geçti: 54 statik sayfa üretildi.
- `git diff --check` — geçti; biçim/boşluk hatası yok.
- Kaynak taraması — gerçek `@tauri-apps/api` importu ve `invoke` çağrısı yalnız `src/lib/native.ts` içinde. `src-tauri/src/backend/commands.rs` içindeki eşleşme açıklama yorumudur.
- Web tarayıcı denemesi — `/sepet/` ekranına bir test bileti eklendi; simüle satın alma tamamlandı ve sayfada doğrulama özeti ile deterministik `CNQ-SALON1-2130-E47EED` PNR'ı gösterildi. Test sırasında oluşturulan ilgili `localStorage` anahtarları temizlendi.
- Tauri masaüstü/mobil cihaz denemesi ve ekran görüntüsü alınmadı; yerel komutun fiziksel hedef platformlarda elle denenmesi kullanıcı kontrolü olarak kaldı.

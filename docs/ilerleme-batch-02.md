# CineQ — Batch 02 İlerleme Matrisi

Hafta 4'teki Görev 10–16 için çalışma, dal/PR, istem günlüğü ve doğrulama özeti. Durum, görev kayıtlarındaki kanıtlara, yapılandırmaya ve Git geçmişine göre kaydedilmiştir.

| Görev | Yapılan çalışma | Dal ve PR | İstem günlüğü | Doğrulama durumu |
|---|---|---|---|---|
| 10 — Çalışma yöntemi | Görev şartnamesi şablonu, istem günlüğü biçimi ve plan-onay-değişiklik-doğrulama çalışma döngüsü eklendi; Hafta 3/4 incelemesi salt okunur yapıldı. | `feature/10-calisma-yontemi` · [PR #21](https://github.com/Harun-Ekici/Cinema-App-Deneme/pull/21) | [10-calisma-yontemi.md](istemler/10-calisma-yontemi.md) | `bun run build`: 0 hata, 26 sayfa. Çalışma döngüsü kuralı yeni Copilot sohbetinde ayrıca kontrol edildi. |
| 11 — Veri sözleşmesi | Film, seans, bilet ve büfe tipleri merkezileştirildi; örnek kayıtlar altışara tamamlandı; Astro check betiği ve veri modeli belgesi eklendi. | `feature/11-veri-sozlesmesi` · [PR #22](https://github.com/Harun-Ekici/Cinema-App-Deneme/pull/22) | [11-veri-sozlesmesi.md](istemler/11-veri-sozlesmesi.md) | `bun run check`: 0 hata/uyarı; `bun run build`: 0 hata, 26 sayfa. Veri sayımları ve `any` kaynak taraması kaydedildi. |
| 12 — Kart bileşeni | Domain bağımsız, erişilebilir genel kart ve `KartProps` tipi eklendi; Keşfet ekranı altı film için genel karta geçirildi; RTL ve tema token'ları gözetildi. | `feature/12-kart-bileseni` · [PR #23](https://github.com/Harun-Ekici/Cinema-App-Deneme/pull/23) | [12-kart-bileseni.md](istemler/12-kart-bileseni.md) | `bun run check`: 0 hata/uyarı; `bun run build`: 0 hata, 26 sayfa. Altı kart, klavye etkileşimi, RTL ve stil bağımsızlığı tarayıcıda kontrol edildi. |
| 13 — Liste ve üç durum | Yükleniyor, hata ve boş durum bileşenleri Keşfet/Biletlerim ekranlarına bağlandı; dört dil, URL ile test simülasyonu ve geliştirme notları eklendi. | `feature/13-liste-ve-uc-durum` · [PR #24](https://github.com/Harun-Ekici/Cinema-App-Deneme/pull/24) | [13-liste-ve-uc-durum.md](istemler/13-liste-ve-uc-durum.md) | `bun run check`: 0 hata/uyarı; `bun run build`: 0 hata, 26 sayfa. Dört görünüm, tekrar deneme, filtre temizleme, dört dil ve RTL tarayıcıda doğrulandı; ekran görüntüleri günlükte bağlantılı. |
| 14 — Detay ekranı | Film detayları için 4 dilde 24 statik rota, bulunamadı görünümü, arama/süzgeç korumalı geri dönüş ve mimari ağaç güncellemesi yapıldı. | `feature/14-detay-ekrani` · [PR #25](https://github.com/Harun-Ekici/Cinema-App-Deneme/pull/25) | [14-detay-ekrani.md](istemler/14-detay-ekrani.md) | `bun run check`: 0 hata/uyarı; `bun run build`: 0 hata, 54 sayfa. Dil rotaları, 404, geri dönüş ve RTL tarayıcıda doğrulandı; ekran görüntüleri günlükte bağlantılı. |
| 15 — Rust komutu | Tipli `bilet_hesapla` komutu, hata sözleşmesi ve Rust testleri; tek `native.ts` köprüsü, tarayıcı demo yedeği, satın alma sonucu/hata arayüzü ve platform/komut belgeleri eklendi. | `feature/15-rust-komutu` · [PR #26](https://github.com/Harun-Ekici/Cinema-App-Deneme/pull/26) | [15-rust-komutu.md](istemler/15-rust-komutu.md) | `cargo test`: 7 test geçti; `bun run check`: 0 hata/uyarı; `bun run build`: 0 hata, 54 sayfa. Web demo satın alma tarayıcıda doğrulandı. Tauri masaüstü/mobil elle test ve ekran görüntüsü yapılmadı. |
| 16 — Tauri pencere boyutları | Pencere minimum genişliği 360, yüksekliği 640 yapıldı. | `v0.2.0-batch-02` | — | Tauri yapılandırması ve etiket doğrulandı; güncel build/Lat sonucu aşağıdadır. |

## Hafta 4 doğrulama özeti

- Görev 10–15 için ayrı feature dalları açıldı ve Git geçmişinde PR #21–#26 ile `master` dalına birleştirildikleri görülüyor.
- Her görevin istem günlüğü yukarıda bağlantılıdır; günlükler araç/model bilgisini, istemi, onaylanan planı, düzeltmeleri ve mevcut doğrulama kanıtlarını içerir.
- Build sonuçları Görev 10–13 için 26, Görev 14–15 için 54 statik sayfa ve 0 hata olarak kaydedilmiştir.
- Görev 15'in Rust testleri ve web satın alma akışı doğrulanmıştır. Fiziksel masaüstü/mobil Tauri doğrulaması yapılmadığından bu adım tamamlanmış sayılmamıştır.
- İstem günlüklerinde yer alan görev dışı mevcut `CanliRozet.tsx` React import ipucu, görev doğrulamalarında hata veya uyarı olarak rapor edilmemiştir; check çıktısında bir hint olarak belirtilmiştir.
- Bu güncellemede `lat check` başarılı olmuş, `bun run build` 54 statik sayfayı 0 hatayla üretmiştir.

## Görev 16 — Tauri Pencere Boyutları

Tauri uygulama penceresi için minimum genişlik 360, minimum yükseklik 640 olarak [`tauri.conf.json`](../src-tauri/tauri.conf.json) içinde tanımlanmıştır. `v0.2.0-batch-02` etiketi depoda mevcuttur. Bu görev tamamlanmıştır; Görev 15'in elle platform doğrulaması ayrı bir açık madde olarak kalır.

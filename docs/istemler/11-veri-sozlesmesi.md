# Görev 11 — Veri Sözleşmesi kaydı

## Araç ve model

- Araç: Copilot SDK in VS Code
- Model: Bu oturumda model adı görünür değil.

## İstem

CineQ sinema ve büfe rezervasyon uygulamasının veri sözleşmesini denetle ve tamamla. Film, seans, bilet ve büfe ürünü için `src/lib/types/` altında ayrı dosyalarda açıklamalı tipler oluştur; durum/format alanlarını sabit union yap; dağınık store tiplerini taşı; her ana veri tipinden en az altı gerçekçi örnek kaydı sağla. `@astrojs/check` gereksinimini denetleyip `bun run check` betiğini ekle, `docs/veri-modeli.md` ve AGENTS indeks/kural güncellemesini yap. Önce yalnızca plan sun ve onay bekle; onay sonrası `bun run check` ve `bun run build` ile doğrula. Çalışma günlüğü oluştur.

## Plan

1. Mevcut veri tiplerini, uygulama verisini, store'ları, paket betiklerini ve Görev 11 şartnamesini incelemek.
2. Film, seans, bilet, büfe ve sepet tiplerini ortak tip modüllerine taşımak; mevcut kullanım adlarını ve arayüz davranışını korumak.
3. Örnek veriyi tek dosyada tutup ana kayıt koleksiyonlarını en az altı elemana tamamlamak.
4. `astro check` betiğini ve gerekli Astro check bağımlılığını eklemek.
5. Veri modeli belgesini ve AGENTS kural/indeks güncellemesini eklemek.
6. Tip kontrolü, build ve diff doğrulaması çalıştırıp sonuçları kaydetmek.

Plan kullanıcı tarafından onaylandı.

## Düzeltmeler

- Mevcut `Film.seanslar` saat dizisi ve bilet kayıt şekli arayüzde kullanıldığından korundu; yeni `Seans` kayıtları ayrı, ilişkili örnek koleksiyon olarak eklendi.
- Daha önce kaydedilmiş yerel biletlerle uyumluluk için `Bilet.filmId`, `Bilet.seansId` ve `Bilet.durum` isteğe bağlı bırakıldı; yeni örnek ve satın alma kayıtlarında durum/film ilişkisi doldurulur.
- Astro'nun ürettiği `.astro/content.d.ts` içindeki `any` kullanımları üretilmiş dosya olduğu için düzenlenmedi; uygulama kaynaklarındaki `any` kullanımı ayrıca taranacak.

## Doğrulama sonucu

- `bun run check`: başarılı, 0 hata ve 0 uyarı; bir önceden var olan React importu için hint bildirildi.
- `bun run build`: başarılı, 0 hata; 26 statik sayfa üretildi ve `Complete!` mesajı alındı.
- Örnek kayıt sayımı: Film 6, Seans 6, Bilet 6, Büfe ürünü 6.
- Kaynak taraması: `src/` altındaki uygulama TypeScript/Svelte/Astro dosyalarında `any` eşleşmesi bulunmadı. `.astro/content.d.ts` Astro tarafından üretilir ve kaynak kod değildir.
- `git diff --check`: başarılı; yalnızca `bun.lock` ve `package.json` için çalışma ağacı satır sonu dönüşümü uyarısı görüldü.
- Elle kontrol: veri alanları ve ilişkiler kullanıcı tarafından gözden geçirilecek; uygulama görünümünün değişmediği elle denenmeli.

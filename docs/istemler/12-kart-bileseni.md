# Görev 12 — Kart bileşeni kaydı

## Araç ve model

- Araç: Copilot SDK in VS Code
- Model: Bu oturumda model adı görünür değil.

## İstem

CineQ film listesinde kullanılacak, domain tiplerinden bağımsız ve erişilebilir bir Svelte 5 genel kartı oluştur. `KartProps` tipini `src/lib/types/ui.ts` içinde tanımlayıp `index.ts` üzerinden dışa aktar. Kartın renk, boşluk, border ve geçiş değerlerini CSS değişkenleriyle sağla; görselsiz, uzun başlıklı ve RTL düzenleri destekle. Film verisini ana ekranda karta dönüştür, eski özel film kartını kaldır, en az altı filmi listele, `bun run check` ve `bun run build` çalıştır. Önce plan sunup onay bekle; görev günlüğü oluştur.

## Plan

1. Mevcut görev şartnamesi, ana ekran, eski kart bileşeni, tip indeksi, tema token’ları ve çalışma ağacını incelemek.
2. Domain bağımsız `KartProps` tipini ve Svelte 5 `$props` kullanan genel kartı eklemek.
3. Klavye etkileşimi, erişilebilir görsel metni, uzun başlık, görselsiz düzen ve RTL yönünü desteklemek.
4. Kart tasarım token’larını `app.css` içine eklemek; ana ekranı Film → KartProps dönüşümüyle genel karta geçirmek ve eski kartı silmek.
5. Check, build, stil taraması ve diff doğrulaması çalıştırıp sonuçları kaydetmek.

Plan kullanıcı tarafından onaylandı.

## Düzeltmeler

- Görev açıklaması Enter’ı anıyor ancak istem ayrıca Space davranışı da talep ediyor. Linkte Enter doğal gezinme için korundu, Space ile gezinme eklendi; callback kullanımı semantik buton olarak tasarlandı.
- İlk geliştirici sunucusu kontrolünde eylemsiz `article` için Svelte erişilebilirlik tanısı görüldü. Kartın etkileşimsiz kalmaması için `KartProps`, `href` veya `onTikla` seçeneklerinden tam birini zorunlu kılacak şekilde daraltıldı.
- `public/` içinde film afişi bulunmadığı için film kartı görsel alanı boş bırakılarak doğrulanacak; generic komponent görsel verildiğinde açıklayıcı alt metni gösterecek.
- Klavye ve RTL doğrulaması derleme komutlarının kanıtlayamayacağı manuel kontrol adımları olarak ayrıca kaydedildi.

## Doğrulama sonucu

- `bun run check`: 0 hata, 0 uyarı; mevcut `CanliRozet.tsx` dosyasındaki kullanılmayan `React` importu için 1 hint bildirildi.
- `bun run build`: başarılı; 26 statik sayfa üretildi ve `Complete!` mesajı alındı.
- Ana sayfa tarayıcı kontrolü: altı kart ve altı film başlığı render edildi; tüm kartlar film detay adresine bağlandı.
- Klavye kontrolü: ilk film kartında Space ve Enter ayrı ayrı `/etkinlik/1` adresine yönlendirdi.
- RTL kontrolü: belge yönü `rtl` yapıldığında kartın hesaplanan metin hizası `start`; görselsiz altı kartın düzeni korundu.
- Stil taraması: `Kart.svelte` içinde hex/rgb/hsl renk kodu ve domain tipi/özel kart bağımlılığı bulunmadı; boşluk, renk, kenarlık ve geçişler CSS değişkenlerinden alınıyor.
- `git diff --check`: başarılı.
- Tarayıcı geliştirici konsolunda görev kapsamı dışında, mevcut React `CanliRozet` bileşeninden `_jsxDEV is not a function` hatası gözlendi; görev değişiklikleri bu bileşene dokunmadı.
- Elle kontrol: gerçek Arapça/Farsça gezinme ve görselli bir örnek kart kullanımı ayrıca kullanıcı tarafından denenebilir.

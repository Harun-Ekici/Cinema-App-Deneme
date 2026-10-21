# Görev 10 — Çalışma yöntemi kaydı

## Araç ve model

- Araç: Copilot SDK in VS Code
- Model: Bu oturumda model adı görünür değil.

## İstem

> Bu repoda bundan sonra her görevi şu döngüyle yapacağız: şartname, plan, değişiklik, doğrulama.
> 1. `docs/gorev-sartnamesi.md` adında, benim her görevde dolduracağım kısa bir şablon oluştur. Başlıklar: Amaç, Kapsam dışı, Kabul ölçütleri, Dokunulacak dosyalar, Doğrulama adımları.
> 2. `docs/istemler/README.md` oluştur: her görev için `NN-kisa-ad.md` dosyası açılır; içinde araç ve model, istem, plan, düzeltmeler ve doğrulama sonucu yazar.
> 3. `AGENTS.md` dosyasına "Çalışma döngüsü" bölümü ekle: önce plan sun ve onayımı bekle; onaydan sonra değiştir; her görev ayrı dalda ve PR ile; `bun run build` 0 hata vermeden bitti deme.
> 4. Yeni belgeleri `AGENTS.md` doküman indeksine ekle.
> Önce sadece planını göster, ben onaylayınca uygula.
>
> Hafta 3 ve Hafta 4 görevlerini de incele; yaptıklarımda hata var mı kontrol et. Bu kısım yalnızca izleme görevi.

## Plan

1. Hafta 3 ve Hafta 4 görev belgelerini okuyup mevcut çıktılarla karşılaştırmak; bu incelemede dosya değiştirmemek.
2. CineQ örnekleri içeren görev şartnamesi şablonunu ve istem günlüğü açıklamasını oluşturmak.
3. `AGENTS.md` doküman indeksini ve çalışma döngüsü kurallarını güncellemek.
4. Değişiklikleri gözden geçirip `bun run build` ile doğrulamak; inceleme bulgularını ve doğrulama sonucunu raporlamak.

Plan kullanıcı tarafından onaylandı.

## Düzeltmeler

- İnceleme bölümü salt okunur tutuldu; mevcut görev dosyaları değiştirilmedi.
- `docs/kurallar.md` dosyasında önceden var olan kullanıcı değişikliği korunarak bırakıldı.
- Model adı oturumda görünmediği için tahmin edilmedi.

## 5. Doğrulama Sonucu
- **Terminal Çıktısı:** `bun run build` komutu çalıştırıldı, 0 hata ile 26 sayfa başarıyla derlendi.
- **Kural Doğrulama Testi:** Yeni ve temiz bir Copilot sohbetinde "Bu repoda bir görevi hangi sırayla yaparsın?" sorusu yöneltildi. Ajanın verdiği yanıt:
  > "Bu repoda bir görevi şu sırayla yürütürüm:
  > 1. Şartnameyi ve ilgili görev belgelerini incelerim. Amaç, kapsam dışı maddeler, kabul ölçütleri, dokunulacak dosyalar ve doğrulama adımlarını netleştiririm. Şablon gorev-sartnamesi.md dosyasında.
  > 2. Değişiklik yapmadan önce planı sunarım. Kapsamı, dosyaları ve doğrulamayı belirtir; açık onayınızı beklerim.
  > 3. Onaydan sonra ayrı bir feature/... veya fix/... dalında çalışırım. Yalnızca onaylanan kapsamı uygular, proje kurallarına ve ilgili dokümantasyona uyarım.
  > 4. Değişiklikleri doğrularım. Gerekli testleri çalıştırır ve bun run build komutunun hatasız tamamlandığını kontrol ederim.
  > 5. İstem günlüğüne planı, düzeltmeleri ve doğrulama sonucunu kaydederim. Günlük biçimi istemler/README.md dosyasında açıklanıyor.
  > 6. Sonucu PR ile sunarım. master/main dalına doğrudan commit atmam.
  > Bu sıra, repodaki AGENTS.md çalışma döngüsüne dayanıyor."
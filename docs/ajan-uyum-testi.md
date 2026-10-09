# CineQ — Ajan Uyum Testi

Görev 08'in son ölçütü: bir yapay zeka ajanına bir renk ve bir sayfa görevi verilir, `AGENTS.md` kurallarına uyup uymadığı denetlenir.

> Bu test 09.10.2026'da **eğitmen tarafında** yapıldı; öğrencinin kendi aracıyla yaptığı bir test değildir. Öğrenci aynı testi kendi aracıyla tekrarlayıp sonucu bu dosyaya eklemelidir.

## Verilen görevler

| Görev | İstenen | Sonuç |
|---|---|---|
| Renk görevi | Üst bara logo ekle, dil seçiciyi marka renkleriyle biçimlendir | Logo `--renk-koyu` ve `--renk-ana` değerleriyle çizildi; `DilSecici.astro` yalnız `--kenar`, `--renk-ana`, `--kart` değişkenlerini kullanıyor |
| Sayfa görevi | Dört bilgi sayfasını dört dile çevir ve dil başına ayrı rotaya koy | 16 sayfa üretildi; `docs/mimari-agac.md` güncellendi; AR ve FA sayfaları `dir="rtl"` |

## Kural bazında denetim

| `AGENTS.md` kuralı | Uyuldu mu | Kanıt |
|---|---|---|
| Her iş ayrı dalda ve PR ile; `master`'a doğrudan commit yok | ✅ | `fix/05-logo-ve-ikon-seti`, `feature/06-dil-rotalari`, `docs/09-batch-01-tamamlama` |
| Sabit renk kodu yazılmaz; `docs/branding.md` ve CSS değişkenleri kullanılır | ⚠️ | Yeni bileşenlerde sabit renk yok. SVG logonun içinde renkler zorunlu olarak sabit; değerler `branding.md` ile aynı |
| Yeni rota `docs/mimari-agac.md` ile uyumlu | ✅ | Dil rotaları bölümü eklendi |
| Dokümanlar tekrarlanmaz, link edilir | ✅ | Yeni belgeler `AGENTS.md` indeksine eklendi |
| Svelte 5 Runes | ✅ | `IletisimFormu.svelte` `$props()` ve `$derived` kullanıyor |
| `bun run build` 0 hata | ✅ | 26 sayfa |

## Bulgular

- `IletisimFormu.svelte` içindeki başarı bildirimi sabit yeşil renkler kullanıyor (`#10b981`, `#059669`); `app.css`'e bir başarı rengi değişkeni eklenip oradan alınmalı.
- Üst bardaki tema düğmesi ve logo metni sabit beyaz (`#fff`) kullanıyor.
- Ana ekranlar (`Kesfet`, `EtkinlikDetay`, `Sepet`, `Biletlerim`) hâlâ şablondaki bilet uygulamasının içeriğini gösteriyor (futbol, konser); sinema içeriği Hafta 04 görevlerinde taşınacak.

# Rezervasyon Alanı

CineQ alan modeli; filmleri ve seansları, ortak sepetteki bilet seçimlerine, koltuklara ve büfe ürünlerine bağlar.

Alanların ve ilişkilerin yetkili tanımı [[docs/veri-modeli.md]] belgesinde tutulur; model tipleri [[src/lib/types/index.ts]] üzerinden dışa aktarılır.

## Film ve Seans

Film; tanıtım ve gösterim bilgilerini taşır. Her seans tarih, salon, format ve yaşam döngüsü durumunu tanımlar. Örnek kayıtlar [[src/lib/data.ts#filmler]] içinde, uygulama kimliğine göre film bulan işlev [[src/lib/data.ts#filmBul]] içindedir.

Temel tip tanımları [[src/lib/types/film.ts#Film]] ve [[src/lib/types/seans.ts#Seans]] bölümlerindedir.

## Bilet ve Büfe

Bilet seçimi; filmi, seansı, salonu, koltukları, bilet kategorisini ve fiyatı taşır. Büfe seçimi ürün, isteğe bağlı porsiyon, adet ve birim fiyatı taşır. Sepet bu kayıtları bilet ve büfe kalemleri olarak ayırt eder.

İlgili tipler [[src/lib/types/bilet.ts#Bilet]], [[src/lib/types/bufe.ts#BufeUrunu]] ve [[src/lib/types/sepet.ts#SepetKalemi]] bölümlerindedir. İsteğe bağlı alanlar ve uyumluluk notlarının ayrıntıları [[docs/veri-modeli.md]] içinde tutulur.

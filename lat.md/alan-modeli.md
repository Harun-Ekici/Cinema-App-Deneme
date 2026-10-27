# Rezervasyon Alanı

CineQ alan modeli; filmleri ve seansları, ortak sepetteki bilet seçimlerine, koltuklara ve büfe ürünlerine bağlar.

Alanların ve ilişkilerin yetkili tanımı [[docs/veri-modeli.md]] belgesinde tutulur; model tipleri [[src/lib/types/index.ts]] üzerinden dışa aktarılır.

## Film ve Seans

Film ve seansların müşteri vitrini kaynağı SQLite'tır; [[src/lib/katalog.ts#vitrinFilmleriniYukle]] bunları tipli Film ve salon haritası görünümüne dönüştürür.

Temel film, seans ve gerçek salon yerleşimi tipleri [[src/lib/types/film.ts#Film]], [[src/lib/types/seans.ts#VitrinSeansi]] ve [[src/lib/types/seans.ts#VitrinKoltukHaritasi]] bölümlerindedir.

## Bilet ve Büfe

Bilet seçimi; filmi, gerçek seans kimliğini, salonu, koltukları, bilet kategorisini ve VIP dahil seans fiyatını taşır. Büfe seçimi ürün, isteğe bağlı porsiyon, adet ve birim fiyatı taşır. Sepet bu kayıtları bilet ve büfe kalemleri olarak ayırt eder.

İlgili tipler [[src/lib/types/bilet.ts#Bilet]], [[src/lib/types/bufe.ts#BufeUrunu]] ve [[src/lib/types/sepet.ts#SepetKalemi]] bölümlerindedir. İsteğe bağlı alanlar ve uyumluluk notlarının ayrıntıları [[docs/veri-modeli.md]] içinde tutulur.

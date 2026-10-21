# Proje Durumu

CineQ, kayıtlardaki Batch 01 temelini ve Tauri pencere boyutlandırmasına kadar Batch 02 uygulama görevlerini tamamladı; yerel platform doğrulamalarından biri açıktır.

Kanonik teslim kanıtları [[docs/ilerleme-batch-01.md]] ve [[docs/ilerleme-batch-02.md]] içinde tutulur. Bu sayfa, kanıt tablolarını yinelemeden mevcut durumu özetler.

## Mevcut Kilometre Taşı

Batch 01 ve Batch 02 görevleri 10–14 tamamlandı. Görev 15'in otomatik ve web doğrulaması başarılı olsa da Tauri cihaz denemeleri açıktır. Görev 16, 360×640 minimum pencere ölçüsü ve `v0.2.0-batch-02` etiketiyle tamamlanmıştır.

Pencere sınırları [[src-tauri/tauri.conf.json]] içinde yapılandırılır. Görev tablosu ve doğrulama ayrıntıları [[docs/ilerleme-batch-02.md]] belgesindedir.

## Görev Durumları

Görev şartnamelerinin kanonik yeri [[docs/tasks]], istem ve kanıt kayıtlarının yeri [[docs/istemler]] dizinidir. Aşağıdaki tablo bu kayıtların yerine geçmeyen bir durum dizinidir.

| Görev | Durum | Kanıt / ayrıntı |
|---|---|---|
| Batch 01 | Tamamlandı | [[docs/ilerleme-batch-01.md]] |
| 09.1 — Master koruması | Batch 02 ön koşulu | [[docs/tasks/week-4/09-1-master-korumasi.task.md]] |
| 10–14 — Çalışma yöntemi, veri, kart, liste ve detay | Tamamlandı | [[docs/ilerleme-batch-02.md]] |
| 15 — Rust bileti komutu | Uygulama tamamlandı; yerel platform doğrulaması açık | [[docs/istemler/15-rust-komutu.md]] |
| 16 — Tauri pencere boyutları | Tamamlandı | [[src-tauri/tauri.conf.json]]; `v0.2.0-batch-02` |

## Açık Doğrulamalar

Batch 02 kaydına göre Tauri masaüstü/mobil bilet akışı henüz elle denenmemiş ve ekran görüntüleri eklenmemiştir. Web derlemesini cihaz doğrulaması saymak yerine bu maddeyi açık bırakın.

Bu güncellemede `lat check` başarılı olmuş, `bun run build` 54 statik sayfayı 0 hatayla üretmiştir. Bu, elle Tauri cihaz doğrulamasının yerine geçmez; açığı kapatmak için [[docs/istemler/15-rust-komutu.md]] içindeki platform adımlarını izleyin.

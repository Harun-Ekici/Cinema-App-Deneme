# Proje Kuralları ve Güvenlik İlkeleri

## PR Güvenliği

1. **Master Dalı Koruması:**
   - `master` dalı doğrudan yazmaya karşı korumalıdır.
   - Hiçbir geliştirici `master` dalına doğrudan commit atamaz (`git push origin master` kural ihlali nedeniyle engellenir).
   - Zorla gönderme (`force push` / `--force`) ve dal silme (`branch deletion`) eylemleri tamamen kilitlenmiştir.
   - Tüm değişiklikler istisnasız bir `feature/*` veya `fix/*` dalından açılan Pull Request (PR) üzerinden aktarılır.

2. **Yetkilendirme ve Merge:**
   - PR'ları yalnızca kayıtlı collaborator'lar (depo işbirlikçileri) inceleyip merge edebilir. Dışarıdan katkıcılar veya tanınmayan kullanıcılar yetkisizdir.

3. **Dış Kaynaklı PR İnceleme Prosedürü:**
   - Tanınmayan veya harici bir fork üzerinden gelen PR'lar asla doğrudan merge edilmez.
   - **Files Changed Denetimi:** PR içeriğindeki her dosya satır satır okunur.
   - **Kritik Alan Kontrolü:** Özellikle `.github/workflows/` (CI/CD pipeline), `package.json` (bağımlılıklar ve çalıştırma betikleri), `src-tauri/` (Rust arka uç kodları ve sistem izinleri) ve ortam değişkenleri (`.env`) dikkatle taranır.
   - **Yerel Doğrulama:** Şüpheli kod bulunmayan PR'lar yerel çalışma ortamına çekilerek derleme (`bun run build`) ve testlerden (`cargo test`) geçirilir.
   - **Temel İlke:** Okunmayan, incelenmeyen ve güvenliği doğrulanmayan PR merge edilmez.
# Faz 2B — Gerçek talep ve yönetim akışı

## Yerelde uygulanan kapsam

- Müşteri ekranları: `/requests`, `/roadside`, `/insurance`, `/tow-truck`, `/service-request`, `/premium`. Yönetim ekranı: `/admin`.
- Bireysel/kurumsal yol yardım talebi, Türkiye plakası, 8 kullanım türü, ilk 3 paket. Sigorta, yardım bildirimi, servis rezervasyonu ve Premium için ayrı talep alanları.
- Talep kalıcı API cevabı gelmeden başarı göstermez. Aynı kullanıcı/istek anahtarı için tekrar deneme aynı kaydı döndürür; farklı içerik 409 olur. Günlük 20 yeni talep sınırı veritabanı işleminde uygulanır.
- Paket fiyatı istemciden kabul edilmez; sunucuda güncel katalog sürümü kontrol edilir. Fiyat, açıklama ve bilgilendirme metni talep anındaki sürümüyle korunur.
- TC/vergi numarası WhatsApp metnine, bildirim kuyruğuna veya olay günlüğüne eklenmez. Liste yalnız özet döndürür; detayda numara varsayılan olarak maskelenir. Biçim kontrolü resmi kimlik doğrulaması değildir.
- Admin üyeliği `droto_admins` üzerinden kontrol edilir; değiştirilebilir profil rolü veya kullanıcı metadata'sı yetki vermez. Kullanıcı yalnız kendi talebine erişebilir. Müşteri yazma işlemleri kontrollü API üzerinden gerçekleşir.
- Ödeme teyidi, özel PDF yükleme, bayi paket numarası ve düzenleme ayrı işlemler. Ödeme anına göre bir takvim yılı ve 24 saat bekleme hesaplanır. Geç panel girişi başlangıcı kaydırmaz.
- İlk 15 gün kullanılmamış yol yardım paketinde iptal talebi; admin kullanım teyidi; iptal onayı; tam iadenin tamamlanması ayrı kayıtlar. Geç yapılan admin incelemesinde müşterinin ilk iptal talep zamanı esas alınır.
- Durum değişikliği ve olay kaydı tek SQL işlemidir. Kayıt sürümü uyuşmazsa 409 döner; eşzamanlı işlem önceki değişikliği ezmez.
- PDF en fazla 5 MB, PDF MIME ve dosya başlığı kontrolü. Özel storage bucket; yetkili kullanıcıya 60 saniyelik indirme bağlantısı. Bu kontrol PDF zararlı yazılım taraması iddiası taşımaz.
- Premium aylık/yıllık manuel talep, ödeme ve üyelik etkinleştirme kaydı hazır. Ücretli özelliklerin tüm ekranlarda kısıtlanması ve AI kotaları bu fazda tamamlanmadı; ticari Premium açılışı için ayrıca gereklidir.
- Yeni taleple aynı SQL işleminde admin e-posta kuyruğu kaydı oluşturulur. E-posta gönderici/worker henüz bağlanmadı; kuyruk kaydı e-posta gönderildiği anlamına gelmez.
- Kişisel bakım planı gerçek servis rezervasyonundan ayrıldı; rezervasyon için yeni talep bağlantısı var. Bakım kaydında Supabase hatası kontrol edilmeden form kapanması düzeltildi.
- SOS ekranındaki otomatik konum aktarımı iddiası kaldırıldı. Acil numaralar 112 olarak güncellendi. [Resmi 112 kaynağı](https://112.gov.tr/112-acm-projesi).
- CI dosyası test ve derlemeyi çalıştıracak şekilde eklendi; henüz GitHub'a gönderilmedi.

## Veritabanı değişikliği

Migration: `supabase/migrations/20260909191803_droto_requests.sql` (Supabase CLI ile oluşturuldu; uygulama sonrasında canlı migration sürümüyle eşlendi).

Yeni tablolar: droto_admins, droto_settings, droto_catalog, droto_requests, droto_request_events, droto_outbox. Hepsinde RLS açık. İki yazma fonksiyonu SECURITY INVOKER, sabit boş search_path ve yalnız service_role çalıştırma izni kullanır. Kullanıcılara yalnız kendi taleplerinde SELECT tanımlıdır. Özel PDF bucket tarayıcı yazmasına açık değildir.

Eski teklif/checkout/poliçe tabloları varsa müşteri rollerinin yazma izinleri kaldırılır; geçmiş kayıtlar silinmez. Canlı şema incelenmeden migration uygulanmamalı.

Makinede Docker/Postgres servisi bulunmadığından SQL testleri PGlite PostgreSQL motorunda, Supabase'e ait auth/storage şemalarının minimal test karşılıklarıyla çalıştırıldı. Canlı Supabase uyumluluğu, storage servisi ve advisor sonuçları ayrıca doğrulanmalıdır; PGlite tüm Supabase servislerinin yerine geçmez.

## Doğrulama

- `npm test`: iş kuralları, 24 saat/15 gün/bir yıl sınırları, artık yıl, ödeme tutarı, sahte müşteri alanları, HTTP yetkilendirme, PostgreSQL RLS, RPC izinleri, idempotency, sürüm çatışması ve olay/kuyruk atomikliği.
- `npm run build`: TypeScript, Vite ve sunucu derlemesi.
- Bağımlılık düzeltmeleri sonrası npm denetimi 0 bilinen açık raporladı. `tsx` sabitlendi; Express için `qs` 6.16.0 override'ı var. Yeni advisory ve üst bağımlılık sürümleri çıktığında override yeniden değerlendirilmeli. Bu sonuç tüm uygulamanın güvenli olduğu garantisi değildir.
- Yerel tarayıcı: giriş, talep ekranı, bireysel/kurumsal geçiş, yönetim paneli ve mobil talep detayı. API cevapları ve oturum yalnız yerel örnek verilerle taklit edildi; bu kontrol gerçek Supabase/e-posta/storage uçtan uca testi değildir.

## Canlı bağlantı için bekleyenler

Bağlı Supabase hesabında Droto adlı proje pasif bulundu. Depoda gerçek proje adresi yok; yalnız `.env.example` yer tutucuları var. Hedef proje kullanıcıyla kesinleştirilmeli, ardından şema ve yetkiler salt okunur incelenmeli. Migration ve canlı ayarlar henüz uygulanmadı; deploy/push yapılmadı.

Başlangıç admin'i doğrulanmış Auth kullanıcı UUID'si ile atanmalı. E-posta yazmak tek başına yetki vermez. Servis anahtarı sunucu ortamına güvenli yöntemle tanımlanmalı; sohbete veya public repoya yazılmamalı.

Çağrı merkezi/WhatsApp, işletmeye ait bilgilendirme metni ve gerçek paket kapsamı admin panelinden girilecek. Talepler varsayılan olarak kapalıdır; telefon ve bilgilendirme metni olmadan açılmaz. E-posta göndericisi ve bildirim worker'ı; AI bütçesi/kotaları; aile daveti/paylaşım yetkileri; diğer modüllerin kalan veri düzeltmeleri ana üretim çalışmasının açık işleridir.

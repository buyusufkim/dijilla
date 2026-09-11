# Profil tercihleri ve destek

11 Eylül 2026.

## Bulgu ve değişiklik

Profil bildirim anahtarları `profiles.notification_settings` alanına yazıyordu; canlı şemada bu alan yoktu. İstemci Supabase'in döndürdüğü `error` alanını kontrol etmediği için başarısız kayıt değişmiş gibi görünüyordu.

- `20260911174620_droto_notification_preferences` migration'ı alanı canlıya ekledi. JSON nesnesi ve bilinen üç tercihin boolean olması veritabanında kontrol edilir. Mevcut sahiplik politikaları ve yetkiler korunur.
- Tercihler yüklenmeden anahtarlar açılmaz. Başarı yalnız yazılan satır ve değer doğrulandıktan sonra gösterilir. Hata ve boş satır durumları görünürdür; anahtar eski değerini korur. Eşzamanlı değişiklikler önceki JSON değeriyle karşılaştırılır; eski ekran başka oturumun tercihini ezmez. Kullanıcının bilinenler dışındaki tercih alanları korunur.
- `/support` giriş gerektiren Destek & SSS sayfasıdır. Profildeki boş düğme bu sayfayı açar. Telefon, WhatsApp, e-posta ve çalışma saatleri yönetimde kayıtlı bilgilerden gelir. Eksik iletişim bilgileri için numara uydurulmaz. Talepler ve yardım bildirimi bağlantıları çalışır; WhatsApp/e-posta yalnız kullanıcı tıklamasıyla açılır.
- SSS mevcut ödeme, paket, iptal, yardım ve belge akışlarını açıklar. Otomatik hatırlatma gönderimi henüz çalışmadığı belirtilir. Aile listesinin yalnız bu tarayıcıda tutulduğu ve paylaşım yetkisi vermediği profil ekranında açıklanır.

## Kontrol

15 otomatik test ve production derlemesi başarılı. Yeni testler hatalı/boş/çelişkili kayıt yanıtlarını, eski veriyle yazmayı önleyen filtreyi, migration biçim kısıtlarını ve sahiplik sınırını kapsar. Canlı veritabanında authenticated rolüyle kendi profilini güncelleme rollback içinde doğrulandı; gerçek kullanıcı tercihleri değiştirilmedi. Yerel test verileri gerçek müşteri verisi değildir.

Supabase danışmanında yeni uyarı oluşmadı. Önceki beş sunucu tablosu için politikasız RLS bilgi notu beklenir. Önceden bulunan [sızdırılmış parola koruması](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) uyarısı devam ediyor.

Bu aşama otomatik e-posta/hatırlatma gönderimini veya davetle aile paylaşımını devreye almaz.

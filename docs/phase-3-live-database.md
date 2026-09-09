# Faz 3 — Canlı Droto veritabanı

9 Eylül 2026: Kullanıcı Supabase projesini aktifleştirdi. Proje durumu ACTIVE_HEALTHY olarak doğrulandı. Altı Auth hesabı mevcut; liste aracındaki tahmini satır sayıları gerçek veri yokluğu olarak yorumlanmadı.

## Uygulanan değişiklikler

- `20260909191803_droto_requests`: talep, katalog, ayarlar, admin üyeliği, olay günlüğü, bildirim kuyruğu ve özel paket PDF alanı.
- `20260909191837_droto_internal_function_permissions`: `handle_new_user` ve `rls_auto_enable` iç fonksiyonlarının public/anon/authenticated doğrudan EXECUTE izinleri kaldırıldı. Fonksiyon gövdeleri ve tetikleyiciler korunuyor.
- Kullanıcının önceden belirttiği yönetici adresi Auth içinde doğrulanmış hesapla eşleştirilerek bir admin üyeliği atandı. Kişisel e-posta/UUID kaynak dosyaya eklenmedi.
- Yerel migration dosyalarının sürümleri canlı migration geçmişiyle eşlendi.

İlk migration denemesi otomatik onay denetiminde production kapsamı için açık onay eksikliği nedeniyle reddedildi. Kullanıcının devam onayından sonra aynı migration başarıyla uygulandı. Sonraki izin migration'ı da başarılı.

## Doğrulama

- Eco 75.000, Standart 90.000, PRO 150.000 kuruş; üç katalog kaydı mevcut.
- Paket PDF bucket'ı private. Müşteri rolünde talep UPDATE izni ve yazma RPC EXECUTE izni yok; service_role çalıştırabiliyor.
- Gerçek PostgreSQL sunucusunda yalnız işlem süresince açılan test ayarıyla talep RPC'si çalıştırıldı, ardından ROLLBACK yapıldı. Son kontrol: sıfır kalıcı talep, sıfır kuyruk kaydı ve talep alımı kapalı. Gerçek e-posta/ödeme/çekici işlemi yapılmadı.
- Güvenlik advisor'ında iki iç fonksiyonun istemci EXECUTE uyarıları kalktı. Beş sunucu tablosunda istemci RLS politikası olmaması bilinçli deny-by-default tasarımıdır; istemci tablo yetkileri ayrıca geri alındı. [RLS açıklaması](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Auth sızmış parola koruması hâlâ kapalı. Bu, mevcut şema migration'ından bağımsız Auth ayarıdır. [Supabase parola koruması](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Uygulama yayını

10 Eylül 2026: Kullanıcı mevcut GitHub–Vercel otomatik yayın bağlantısını doğruladı. GitHub'da önceki ana dal commit'inin Vercel kontrolü başarılı. Yayın mevcut bağlantı üzerinden ana dala push ile ilerler; Vercel bağlayıcısının boş takım listesi bu akış için engel değildir. Sunucu servis anahtarı sohbete veya GitHub'a yazılmamalı.

Canlı veritabanı migration'ı uygulama kodunun yayımlandığı anlamına gelmez; uygulama yayını ilgili commit'in Vercel kontrolü ve canlı HTTP kontrolleriyle ayrıca doğrulanmalıdır. Telefon/WhatsApp ve işletme bilgilendirme metni girilmeden talep alımı açılmayacak. E-posta worker'ı, AI bütçe/kota kontrolü, Premium özellik yetkileri ve tüm uygulamanın kalan üretim işleri açık.

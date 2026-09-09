# Faz 2A — Oturum ve güvenli başlangıç

## Uygulananlar

- `/`, `/login`, `/reset-password` giriş/kayıt/doğrulama ve şifre yenileme akışlarıdır. Diğer tüm ekranlar ortak `RequireAuth` sınırındadır. Oturum yüklenirken özel içerik oluşturulmaz; anonim veya e-postası doğrulanmamış hesap içeriğe alınmaz.
- Girişten sonra uygulama içindeki hedefe dönülür; dış URL ve giriş döngüsü engellenir. Bulunamayan sayfa için geri dönüş bağlantısı var.
- Aile ve bildirim sağlayıcıları yalnız doğrulanmış hesabın özel bölümünde oluşturulur. Hesap değişiminde bu bölüm yeniden oluşturulur; önceki hesabın geçici bildirim/ekran durumu taşınmaz.
- Kayıtta profil oluşturan yetkisiz istemci upsert'i kaldırıldı. Depodaki `supabase/schema.sql` zaten `auth.users` için profil oluşturma tetikleyicisi tanımlıyor; canlıda varlığı ayrıca doğrulanmalı.
- Şifre yenileme bağlantısı isteği ve oturumla şifre güncelleme eklendi. Kayıt ve yeni şifre için istemci minimumu 12 karakter; aynı sınır Supabase Auth ayarına da uygulanmalı.
- `/api/health` dışındaki API yollarında sunucudan kullanıcı doğrulaması zorunlu. Doğrulanmamış hesap 403, geçersiz oturum 401, kimlik servisinin erişilememesi 503 alır.
- Eski sahte teklif, ödeme, poliçe router'ları uygulamaya bağlanmıyor. Sigorta satın alma ekranları geçici kullanılabilirlik açıklamasına yönlendirildi. Gerçek talep API'si henüz uygulanmadı; başarılı kayıt iddiası yok.
- AI router'ı kalıcı kota ve bütçe kontrolü hazırlanırken sağlayıcıya çağrı yapmaz. AI istemcisine oturum başlığı eklendi. Bu faz AI kotalarını uyguladığı iddiasını taşımaz.
- API hata cevapları istek gövdesi veya sağlayıcı hata ayrıntısını döndürmez. Health endpoint veritabanını kontrol etmeden hazır olduğunu iddia etmez.

## Doğrulama

`npm test`: kimlik politikası, güvenli dönüş yolu ve gerçek yerel HTTP sunucusunda eksik/geçersiz/doğrulanmamış oturum, kimlik servisi kesintisi, kapalı sağlayıcı yolları ve hassas gövdeli bozuk JSON senaryoları. Kimlik servisi testte taklit edilir; testler gerçek müşteri veya Supabase projesine bağlanmaz.

`npm run build`: TypeScript, Vite ve sunucu derlemesi. Canlı e-posta teslimatı ve tarayıcıda gerçek hesapla uçtan uca doğrulama bu yerel kontrollerin kapsamı dışındadır.

## Canlıya geçişte gerekli doğrulama

- Supabase Auth: e-posta doğrulaması açık; Site URL gerçek Droto adresi; izin verilen dönüş adresleri tam origin ile `/login` ve `/reset-password`.
- E-posta gönderimi, doğrulama bağlantısı, süresi dolan sıfırlama bağlantısı ve gerçek hesapla şifre değiştirme akışı.
- Canlı profil tetikleyicisi ve tüm tablo/storage erişim politikaları. React yönlendirme koruması doğrudan Supabase erişimindeki RLS'nin yerine geçmez.
- Bu faz üretime hazır beyanı değildir; canlı ayar, migration, commit, push veya deploy yapılmadı.

## Sonraki uygulama fazı

Kalıcı talep veri modeli ve admin erişimi: bireysel/kurumsal başvuru, sunucudan katalog/fiyat sürümü, sahibiyle sınırlı okuma, manuel ödeme ve bayi düzenleme durumları, PDF erişimi, 24 saat bekleme / bir yıl geçerlilik / 15 gün kullanılmamış paket iptali. İlk önce SQL ve yetki testleri, sonra müşteri ve admin ekranları bağlanacak. AI Studio ekran çalışması yaparsa mevcut giriş sınırını korumalı ve kayıt API'si sonuçlanmadan başarı göstermemeli.

## Başvurulan resmi dokümanlar

- [Supabase şifre yenileme](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)
- [Supabase oturum olayları](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)

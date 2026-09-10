# Faz 4 — Varlık verileri ve özel belgeler

10 Eylül 2026. Önceki faz `cb1ad35` ile GitHub/Vercel üzerinden yayımlandı. Bu fazın migration'ı `20260910191237_droto_document_files` canlı Droto projesine uygulandı.

## Değişiklikler

- Garaj artık kullanıcı girmediği halde sigorta/muayene bitişi veya “vergi ödendi” bilgisi üretmez. Marka ve model ayrı alanlara da kaydedilir. Araç/konut kaydı veritabanı cevabı doğrulanmadan tamamlanmış sayılmaz; kaydedilen kayıt Realtime gerektirmeden listede görünür.
- Kasko/DASK aktifliği, doğrulanmamış yüzde 25 indirim ve kurulmamış muayene hatırlatıcısı beyanları garaj akışından kaldırıldı. Önceden oluşturulmuş kayıtlar doğruluğu bilinmeden değiştirilmedi.
- Torpido: isteğe bağlı tarih ve PDF/JPEG/PNG dosyası; en fazla 100 belge/hesap, dosya başına 4 MB. Tarih durumu İstanbul takvimine göre görüntüleme anında hesaplanır; belge kaydı resmi teminat doğrulaması sayılmaz.
- Dosyalar `droto-documents` private bucket'ında tutulur. Doğrulanmış giriş kullanan API her işlemde kayıt sahibini kontrol eder. İndirme bağlantısı 60 saniyeliktir; bağlantıya sahip kişi bu süre içinde indirebilir. Doğrudan istemci belge yazma/silme yetkileri kaldırıldı. Mevcut metadata ve eski file_url alanı korunur; canlı incelemede eski belge/dosya sayısı sıfırdı.
- Dosya yükleme öncesi MIME, boyut ve başlangıç baytları kontrol edilir; bu bir zararlı yazılım taraması değildir. Metadata ve dosya ayrı adımlardır: dosya yüklenemezse kaydedilmiş metadata açıkça belirtilir, dosya ekleme yeniden denenebilir. Başarısız metadata eşleştirmesinde dosya temizliği denenir; ağ sonucunun belirsizliğinde önce kayıt yeniden okunur.
- Silme kullanıcı teyidiyle önce dosya, sonra metadata olarak çalışır. İkinci adım başarısız olursa metadata kalır ve hata gösterilir; tekrar denenebilir. Storage ile PostgreSQL arasında dağıtık atomiklik iddiası yoktur.
- Vercel 4,5 MB istek sınırının altında kalmak için belge ve bayi PDF API sınırı 4 MB yapıldı. [Vercel limiti](https://vercel.com/docs/functions/limitations).
- Gider, bakım ve kişisel bakım planı yazarken bağlı aracın da kullanıcıya ait olması restrictive RLS politikalarıyla kontrol edilir. Mevcut SELECT izinleri genişletilmedi.
- Bakım ekranı yeni kayıttan sonra yenilenir; araç değişiminde eski cevaplar atılır. AI kapalıyken uydurulmuş araca özel bakım aralıkları gösterilmez; üreticinin kitapçığına yönlendirilir.

## Doğrulama ve sınırlar

- Yerel testler: tarih sınırları, geçersiz dosya, sahiplik, başarısız yükleme temizliği, başarısız silme, yazma izinleri, 100 belge sınırı ve başka kullanıcının aracına kayıt bağlama reddi. PGlite testi minimal Supabase şeması kullanır; gerçek Storage uçtan uca testi değildir.
- Yerel tarayıcıda örnek oturum/yanıtlarla belge görünümü ve mobil garaj formu kontrol edildi. Gerçek müşteri dosyası yüklenmedi, hesap şifresi kullanılmadı. Gerçek girişle yükle/indir/sil uçtan uca pilot kontrolü ayrıca yapılmalı.
- Canlı migration sonrası private bucket, 4 MB limit, istemci INSERT/DELETE reddi ve altı restrictive politika doğrulandı.
- Güvenlik advisor'ında yeni uyarı oluşmadı. Önceden bilinen [sızmış parola koruması](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) uyarısı sürüyor; beş sunucu tablosundaki politikasız RLS bilinçli istemci erişimi engelidir.
- E-posta worker'ı, aile paylaşımı, AI bütçeleri, Premium hakları ve uygulamanın kalan modülleri ayrı işlerdir. Bu faz tüm uygulamanın production'a hazır olduğu anlamına gelmez.

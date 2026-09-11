# Uygulama ayarları ve yönetim arayüzü

11 Eylül 2026. Kullanıcı ayarları kaydettiği halde talep formunun kapalı kaldığını ve yönetim ekranının mevcut Uygulama Ayarları içine alınmasını istedi.

## Tespit

Canlı Droto ayar kaydı incelemede sürüm 1, boş telefon/WhatsApp/bilgilendirme metni ve kapalı talep alımı durumundaydı. Önceki işlemin kayda ulaşmadığı doğrulandı; kullanıcının başarısız HTTP isteği görülmediği için tek bir kök neden kesinleştirilmedi. Eski telefon doğrulaması yalnız 90 biçimini kabul ediyordu; hata mesajı tüm paket formlarının altında kalıyordu. Canlı service_role UPDATE işlemi rollback ile doğrulandı; test işletme ayarlarını değiştirmedi.

## Uygulama

- Profil > Uygulama Ayarları artık `/settings` sayfasını açar; `/admin` buraya yönlenir.
- Genel Ayarlar, Yol Yardım Paketleri, Talepler ve Çalışma Kuralları ayrı bölümlerdir. Yönetici olmayan hesaplar işletme ayarlarını göremez; API yetkileri ayrıca kontrol edilir.
- İşletme adı, destek e-postası/saatleri ve ayrı hizmet türü anahtarları eklendi. Genel talep anahtarı korunur. İşletme bilgileri açık müşteri formunda gösterilir.
- 05xx, 0850, +90, 0090 ve boşluklu telefonlar sunucuda standart biçime çevrilir. Eksik açılış koşulları Türkçe açıklanır. Hatalar formun başında gösterilir ve görünür alana kaydırılır.
- Kaydetme cevabı ve yeniden okunan ayar sürümü doğrulanmadan başarı gösterilmez. Talep ekranı sekmeye dönüldüğünde ve aynı tarayıcıda ayar güncellendiğinde yeniden okur.
- Kapalı hizmet türü API'de de reddedilir. Sürüm kontrolü eşzamanlı değişikliklerin ezilmesini önler. Talep listesi sayfa içi tür/numara filtresi sunar; filtre global arama diye gösterilmez.
- Paket fiyat/kapsam/görünürlük yönetimi üç kartta toplandı; kayıtlı satış anı bilgileri değiştirilmez. Çalışma kuralları mevcut uygulamanın bilgilendirme görünümüdür, yeni otomasyon veya serbest kural düzenleme iddiası taşımaz.

Migration `20260910193419_droto_application_settings` canlıya uygulandı ve dosya adı geçmişle eşlendi. Önceki boş işletme alanları kullanıcı adına doldurulmadı; talep alımı kendiliğinden açılmadı.

## Doğrulama

13 test ve production derlemesi başarılı. Yeni testler telefon biçimleri, eksik açılış koşulları, yönetici erişimi, başarılı kaydı bootstrap üzerinden yeniden okuma, sürüm çatışması, veritabanı hatası ve kapalı talep türünün API'de reddini kapsar. SQL migration yerel PGlite testine dahil edildi. Masaüstü/mobil arayüz örnek oturum ve yanıtlarla kontrol edildi; gerçek kullanıcı şifresi veya işletme bilgileri kullanılmadı.

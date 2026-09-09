# Droto — Ürün kararları ve açık sorular

## Kapsam

Droto genel araç ve yaşam yönetimi uygulamasıdır. Yol yardım paketi satışı bunun bir modülüdür. Önceki raporda önerilen dar MVP, kullanıcının tüm modülleri kaldırma kararı olarak yorumlanmamalı.

Mevcut kodda 18 sayfa: onboarding, ana sayfa, sigorta, hizmetler, SOS, garaj, araç detayı, koruma dashboard'u, sigorta satın alma, Premium, profil/aile, AI asistanı, çekici, torpido, yakıt, gider, bakım, seyahat. Her modülün gerçek veri ve operasyon gereksinimi ayrı değerlendirilecek.

## Kullanıcının onayladığı kararlar

- Marka: Droto.
- Uygulama içi ekranlar ve işlemler için giriş zorunlu; kayıt/giriş/şifre kurtarma ve gerekli bilgilendirme sayfaları açık.
- E-posta/şifre, e-posta doğrulaması ve şifre sıfırlama kabul edildi; başlangıçta SMS giriş yöntemi yok.
- Başlangıçta tek admin; çalışan erişimleri ileride mümkün olmalı. Gelecekteki çalışanların yetkileri henüz belirlenmedi.
- Yeni satın alma talebi için admin'e e-posta bildirimi.
- Talep sisteme kaydedildikten sonra müşteri WhatsApp görüşmesini başlatabilir.
- İletişim telefonu, WhatsApp ve bildirim alıcıları yönetim ayarlarından sağlanacak; gerçek numara/adres henüz atanmadı.
- Ödeme görüşme sonrasında havale/EFT veya gönderilen ödeme bağlantısıyla alınabilir. Uygulama kart bilgisi toplamaz.
- Admin, bayi panelinin oluşturduğu paket numarası ve PDF belgesini ekleyecek.
- Kalan çekici/kurtarma hakkı ilk sürümde gösterilmeyecek; API ile ileride düşünülebilir.
- Müşteri konumuyla yardım bildirimi oluşturabilecek; çağrı merkezini arama düğmesi de bulunacak. Talep kaydı hizmet kabulü/ekip sevki olarak gösterilmeyecek.
- Admin paket fiyat ve açıklamalarını değiştirebilir. Satın alınan fiyat ve koşulların sürümü korunmalı.

## Yol yardım talebi

- İlk katalog: Eco 750 TL, Standart 900 TL, PRO 1.500 TL. Diğer paketler bu modülün ilk sürümüne dahil değil.
- Bireysel ve kurumsal müşteriler; yalnız Türkiye plakası.
- Bireysel: TC kimlik numarası ilk talepte alınacak; ad, soyad, şehir, telefon. E-posta ve ilçe isteğe bağlı.
- Kurumsal: Vergi kimlik numarası, vergi dairesi, firma unvanı, şehir, telefon. TC alanı yerine vergi alanları; e-posta ve ilçe isteğe bağlı.
- Araç: kullanım türü, model yılı, plaka, marka, araç tipi. Başlangıç tarihi müşteri tarafından seçilmez.
- Kullanıcı, üç paketin de hususi/ticari otomobil, hususi/ticari kamyonet, karavan, traktör, hususi motosiklet ve ticari motokurye için satıldığını belirtti. Örnek sözleşme ile çelişki aşağıda kayıtlı.
- Kimlik/vergi numarası WhatsApp mesajına, e-posta bildirimine, URL'ye veya loglara konulmamalı; yetkili detay görünümünde erişim sağlanmalı. Biçim kontrolü kimlik doğrulaması sayılmaz.
- Kullanıcı kuralı: bir takvim yılı ödeme anında başlar, hizmet 24 saat sonra kullanılabilir. Bayi kaydı tamamlanmadan aktif hizmet izlenimi oluşturulmaz.

## Örnek PDF incelemesi — henüz genel ürün kuralı değil

Kullanıcının yerel olarak paylaştığı tek sayfalık Standart Paket / Dijilla Hususi Paket Sözleşmesi görsel olarak okundu. Müşteriye ait kişisel bilgiler ve sözleşme numarası bu belgeye veya kaynak depoya kopyalanmadı; PDF depoya eklenmedi.

- Örnekte başlangıç ve bitiş aynı gün/ayda, bir yıl arayla; fiyat 750 TL net + 150 TL KDV = 900 TL brüt. Bu örnek diğer paketlerin vergi kırılımını belirlemez.
- Metinde hizmetin yürürlüğe giriş tarihinden bir hafta (7 gün) sonra geçerli olacağı yazıyor. Bu, kullanıcının 24 saat kararıyla çelişiyor. Kod kataloğundaki 24 saat henüz değiştirilmedi; satış koşulları yayınlanmadan hangisinin güncel olduğu sorulmalı.
- Metin hususi kullanımı tanımlıyor; parantezde traktör, ticari taksi, kiralık ve ticari kullanımlar dahil istisnalar bulunuyor. Kullanıcının tüm 8 türe uygunluk beyanıyla eşleşmiyor. Kurumsal müşteri olması tek başına aracın ticari kullanıldığı anlamına gelmez.
- Başlangıçtan itibaren 3 gün içinde iptal veya araç değişikliği talebi koşulu var. İade tutarı, kesinti ve ödeme yöntemi açıklanmıyor; otomatik iade kuralı çıkarılmamalı.
- İki çekim olayı arasında bir hafta koşulu var. Önceden oluşmuş kaza/arıza için düzenlenen pakete hizmet verilmemesi belirtiliyor.
- Hizmet, paket limitleri dahilinde; limit aşımı ve köprü/ücretli geçiş/otopark gibi masraflar müşteriye bırakılmış.
- Çağrı merkezi aranmadan müşterinin kendi çekici organizasyonunu yapması halinde hizmetten yararlanılamayacağı belirtiliyor. Uygulama yardım bildiriminin çağrı merkezi yerine kabul edilip edilmediği netleşmeli.
- Yakıt bitmesi ve lastik patlaması arıza hakkından karşılanıyor; lastik malzemesi/işçilik müşteriye ait.
- Bölge, yol/erişim, doğal afet ve hizmet sağlayıcı olanaklarıyla ilgili sınırlamalar var. Türkiye geneli ifadesi koşulsuz her noktada hizmet garantisi olarak yazılmamalı.

Bu inceleme belgenin ürün gereksinimleri açısından okunmasıdır; hukuki geçerlilik kararı veya yeni sözleşme değildir. Bir Standart hususi örnek, Eco/PRO ve ticari araç koşullarının yerine kullanılamaz.

## Önceki soru turunun başlıkları (9 Eylül cevapları aşağıda)

1. Sigorta: araç/konut/DASK/sağlık ürün kapsamı, manuel acente talebi veya API ve müşterinin mevcut poliçelerini ekleme akışı.
2. Aile/varlıklar: aynı hesapta kayıt mı, davetle ayrı hesap paylaşımı mı; hangi varlık türleri yönetilecek?
3. Garaj/bakım/gider: manuel kayıt, belge yükleme ve servis randevusunun kişisel plan mı gerçek rezervasyon mu olduğu.
4. Yakıt/seyahat/hizmetler: gerçek veri kaynakları, güncel fiyat/traﬁk/nöbet/anlaşmalı kurum verisi sağlayan entegrasyonlar.
5. AI: arıza, bakım ve seyahat rollerinin kapsamı; ücretsiz kullanım kotası ve aylık maliyet hedefi.
6. Hatırlatma: e-posta ve uygulama içi kanallar; kullanıcıya göre tarihler ve varsayılan hatırlatma aralıkları.
7. Premium: mevcut ücretli teklif ekranının gerçek abonelik planına mı, ücretsiz özelliklere mi dönüşeceği.
8. Operasyon: aktif paketi olmayan kullanıcının yardım bildirimi, personel çalışma saatleri ve çağrı merkezine aktarım.

Uygulama geliştirmesine geçmeden önce kullanıcı bu soruları cevaplamak istedi. Henüz yeni ekran/API/veritabanı veya canlı ayar değişikliği yapılmadı.

## 9 Eylül 2026 — Cevapların işlenmesi

Bu bölüm önceki açık soruların cevaplarını kaydeder; yukarıdaki PDF açıklamaları kaynak belge gözlemidir, uygulama kuralı değildir.

- Sözleşme farklarına toplu “evet” cevabı geldi. Çalışma yorumu: PDF eski, güncel bekleme 24 saat ve üç paket 8 araç kullanım türüne açık; iki çekim arasında 7 gün şartı devam ediyor. Çok parçalı soruya tek cevap olduğu için bu yorum kullanıcıya açıkça bildirilecek; yeni sözleşme metni otomatik hazırlanmayacak.
- İade: tam iade. İlk 3 gün süresinin ve hizmet kullanılmış olması halinde uygulanacak koşulun ayrıca netleşmesi gerekiyor; “tam iade” sınırsız iptal hakkı olarak kodlanmayacak.
- Uygulama yardım bildirimi operasyonu otomatik başlatmaz. Çağrı merkezi arama eylemi gösterilecek. Paketi olmayan kullanıcı ücretli yardım isteyebilir; bildirim ücretsiz hizmet hakkı yaratmaz.
- Sigorta sorusuna evet: trafik, kasko, konut, DASK ve tamamlayıcı sağlık teklif talepleri acenteye iletilecek; başlangıç akışı manuel olarak planlanıyor.
- Kullanıcı mevcut poliçelerini ve belgelerini yükleyebilir; Droto/acenteden alınmış olması gerekmez.
- Aile üyeleri arasında paylaşım desteklenecek. Davet, kabul, görüntüleme/düzenleme kapsamı ve geri alma yetkileri henüz ayrıntılandırılmadı.
- Bakım/servis randevusu hem kişisel plan hem gerçek rezervasyon talebi olabilir. Servis kabulü gelmeden talep “onaylı randevu” sayılmayacak; gerçek servis talebinin alıcısı netleşmeli.
- Güncel yakıt, trafik, nöbetçi kurum ve anlaşmalı kurum entegrasyonu mevcut değil. İlk aşamada doğrulanmış harita sonuçları ve resmi kaynak bağlantıları kabul edildi; genel harita sonucu nöbet veya anlaşma teyidi değildir.
- E-posta ve uygulama içi hatırlatma; poliçe/muayene için 30, 7 ve 1 gün önce varsayılanları kabul edildi.
- Premium gerçekten satılacak. Fiyat, ücretli özellik sınırı, abonelik tahsilatı/yenileme ve AI bütçesi henüz belirlenmedi.
- İşletmeci şirket/destek bilgileri henüz hazır değil. Kullanıcı başlangıç irtibatı için kişi ve e-posta paylaştı; kişisel iletişim bilgileri public GitHub kaynaklarına eklenmeyecek. E-posta beyanı otomatik admin yetkisi veya doğrulanmış gönderici alan adı sayılmayacak.

## Son soru turu — 9 Eylül 2026

- Premium: aylık 199 TL / yıllık 1.990 TL kabul edildi. Temel kayıt ve takip ücretsiz; daha yüksek AI kotası, gelişmiş raporlar ve daha geniş aile/araç kapasitesi Premium kapsamında. İlk tahsilat manuel. Ödeme doğrulanmadan Premium açılmaz; otomatik kart çekimi veya otomatik ücretli yenileme varsayılmaz.
- AI bütçesi seçimi geliştiriciye bırakıldı. Başlangıç mühendislik kararı: tüm uygulama için aylık 10 USD AI sağlayıcı tüketim tavanı; altyapı maliyetinden ayrı. Bu bir sağlayıcı fiyatı veya belirli kullanıcı sayısına hizmet garantisi değildir. Ücretsiz kullanıcıya günlük 3, Premium kullanıcıya günlük 20 istek başlangıç kotası; küresel bütçe her zaman öncelikli. İstek başına giriş/çıkış sınırı, eşzamanlı maliyet rezervasyonu ve sunucuda tüketim takibi gerekir; bütçe yoksa sağlayıcı çağrısı yapılmaz. Gerçek model fiyatı uygulama sırasında doğrulanacak. Kotalar admin ayarlarıyla değişebilir, Premium metni sınırsız AI vaat etmez.
- Aile: davet kabulüyle yalnız sahibinin seçtiği araç ve belgeler paylaşılır; düzenleme izni ayrıca verilir. Sahip paylaşımı geri alabilir.
- Gerçek servis rezervasyon taleplerini başlangıçta admin karşılar ve servise iletir. Servis onayı olmadan onaylı randevu gösterilmez; ayrı servis paneli ilk aşamada yok.
- Yol yardım hizmeti kullanılmışsa iş kuralı olarak iptal/iade yok; kullanılmamış uygun taleplerde tam iade. Son cevaptaki “hayır” nedeniyle ilk 3 günlük iptal süresi onaylanmış sayılmadı. Süre netleşmeden otomatik süreye dayalı ret uygulanmayacak. Bu kayıt hukuki uygunluk değerlendirmesi değildir.

## İptal süresinin kesinleşmesi — 9 Eylül 2026

Kullanıcı son cevabıyla yol yardım paketi için ödeme tarihinden itibaren ilk 15 gün içinde, hizmet kullanılmamışsa iptal ve tam iadeyi onayladı. Hizmet kullanılmışsa iptal/iade yok. Önceki 3 günlük süre sorusu kapanmıştır; yukarıdaki belirsizlik notları tarihsel kayıttır. Bu karar Premium iptal koşulu değildir.

API entegrasyonu olmadığından hizmet kullanımı admin tarafından bayi/operasyon kaydı üzerinden doğrulanmalı. Kullanım bilgisi bilinmiyorsa otomatik olarak kullanılmamış kabul edilmemeli. Talep kaydı veya iptal onayı, paranın iade edildiği anlamına gelmez; iade tamamlanması ayrıca kaydedilmeli.

## Önceki turun karar listesi (cevaplandı; yukarıdaki son kararlar geçerlidir)

1. Premium fiyatları, ücretsiz/ücretli özellik sınırı, ilk tahsilat ve yenileme yöntemi.
2. Aylık AI harcama bütçesi ve buna bağlı kullanıcı kotaları.
3. Aile davetlerinde görüntüleme/düzenleme ve paylaşılacak belge/veri seçimi.
4. Gerçek servis rezervasyon taleplerini karşılayacak taraf ve admin üzerinden takip modeli.
5. Tam iadenin süre ve hizmet kullanımı koşulları.

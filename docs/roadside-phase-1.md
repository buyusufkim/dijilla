# Faz 1 — Dijilla yol yardım paketi kararları

Bu belge kullanıcının görüşmede onayladığı ürün kararlarını kaydeder. İlk katalog src/domain/roadside/catalog.ts içindedir. Katalog henüz ekrana veya satış API'sine bağlı değildir; yayın yapılmamıştır.

## Onaylanan kapsam

- Ana uygulamanın adı Droto; yol yardım satışı tüm uygulamanın yalnız bir modülü. Bu belge diğer modüllerin kaldırılması veya ertelenmesi kararı değildir. Genel ürün kararları droto-product-decisions.md belgesindedir.
- Ürün: Dijilla'nın sunduğu çekici ve yol yardım paketi. Sigorta acentesinin sigorta poliçesi satışından ayrı bir ürün akışı.
- Hizmet bölgesi: Kullanıcı beyanına göre Türkiye geneli.
- İlk katalog: Eco Paket 750 TL, Standart Paket 900 TL, PRO Paket 1.500 TL.
- Diğer paketler ilk sürüme dahil değil.
- Uygulama satın alma talebi toplayacak. Müşteriyle WhatsApp veya telefon üzerinden görüşülüp ödeme sonradan alınacak.
- Ödeme uygulama içinde kart bilgisi toplanarak yapılmayacak.
- Paket yetkili personel tarafından mevcut Dijilla bayi panelinde oluşturulacak; API entegrasyonu ilk fazın şartı değil.
- Telefon ve WhatsApp numarası admin panelinden ayrı ayrı yönetilecek. Numara sabit kodlanmayacak.
- Paket süresi teyit edilen başarılı ödeme anında başlar; bir takvim yılıdır.
- Kullanım hakkı ödeme zamanından 24 saat sonra başlar. Bekleme süresi bitiş tarihine eklenmez.
- Panel işlemi veya uygulamaya veri girişinin daha sonra yapılması, ödeme zamanını değiştirmez.
- İptal: teyit edilen ödeme tarihinden itibaren ilk 15 gün içinde, hizmet kullanılmamışsa tam iade. Hizmet kullanılmışsa iptal/iade yok. Bu süre yalnız yol yardım paketine aittir; Premium'a genellenmez.
- Kullanım durumu yetkili personel tarafından bayi/operasyon kaydından doğrulanır; uygulamada yardım bildirimi bulunmaması hizmetin kullanılmadığını kanıtlamaz. İptal talebi, iptal onayı ve iadenin tamamlanması ayrı izlenir.

## Faz 2 için önerilen uygulama davranışı

1. Müşteri paket seçer ve satın alma talebi oluşturur.
2. Talep veritabanına kaydedilir; ancak başarılı kayıt sonrasında talep numarası gösterilir.
3. Müşteriye “Talebiniz alındı, sizinle iletişime geçeceğiz” bilgisi verilir. Talep oluşturmak, ödeme almak veya paket aktifleştirmek değildir.
4. Yetkili personel talebi takip eder; teyit edilen ödeme zamanını, bayi paket numarasını ve düzenleme bilgisini kaydeder.
5. Ödeme ile bayi kaydı ayrı izlenir. Ödeme teyitli fakat bayi kaydı tamamlanmamışsa “Paket oluşturuluyor” gösterilir; kullanım açıkmış gibi sunulmaz.
6. Bayi kaydı tamamlanınca ödeme zamanına göre ilk 24 saatte “Bekleme süresinde”, ardından geçerlilik sonuna kadar “Aktif” gösterilir.
7. Bir yıl sonunda “Süresi doldu” gösterilir. İptal edilen paket aktif görünmez.

Durum değişiklikleri, personel kimliği ve zamanı sunucuda kayıt altına alınmalı. Müşteri kendi ödeme veya paket durumunu değiştirememeli. Fiyat sunucudaki katalogdan alınmalı; talep anındaki fiyat saklanmalı. Admin iletişim ayarları boşsa yanlış veya örnek numara gösterilmemeli.

## Görsel kaynaklardan alınan, tam koşulları henüz doğrulanmamış kapsam

| Paket | Görünen bilgiler |
|---|---|
| Eco | Olay başı 2.500 TL; en yakın tamirhane/sanayiye çekim; yılda 2 arıza ve 2 kaza çekimi; yakıt bitmesi/lastik patlaması arıza hakkından düşer. |
| Standart | Olay başı 4.000 TL; en yakın tamirhane/sanayiye çekim; yaş sınırı yok; yılda 2 arıza ve 2 kaza çekimi; yakıt bitmesi/lastik patlaması arıza hakkından düşer. |
| PRO | Kaza/arıza ayrımı olmadan 4 çekim ifadesi; aynı ilde yetkili servis/sanayiye çekim; kurtarma limiti 5.000 TL; toplam limit 20.000 TL; yılda 1 kurtarma hizmeti. Bazı satırlar görselde kesilmiş. |

Bu tablo tam hizmet sözleşmesi değildir. Eco/PRO araç yaş ve kullanım koşulları, kapsam dışı durumlar, varsa kilometre sınırları ve PRO kurtarma limitinin toplam limit ile ilişkisi henüz doğrulanmadı. Bilinmeyen limit “sınırsız” kabul edilmemeli. Bayi kazanç bilgileri müşteri kataloğuna dahil edilmedi.

## Sonraki fazda netleştirilecekler

- Talep alanları ve bireysel/kurumsal ayrımı droto-product-decisions.md içinde kaydedildi.
- Üç paketin tam hizmet şartları ve araç/plaka değişikliği koşulları. İptal/iade iş kuralı yukarıda kesinleşti. Örnek Standart sözleşmesindeki bekleme, iptal süresi ve ticari araç istisnaları güncel kullanıcı kararlarından farklı; eski örnek doğrudan yeni satış koşulu olarak yayımlanmamalı.
- İlk admin hesabının atanması; başlangıçta tek admin, çalışanlar ileride.
- Bayi panelindeki gerçek başlangıç/bitiş alanlarının uygulamadaki tarihlerle eşleşmesi.

## İş bölümü

Codex: katalog, talep API'si, veri modeli, admin yetkileri, ödeme/paket durumları ve testler. AI Studio'ya ihtiyaç duyulursa müşteri ve admin ekranları için bu belge ve doğrulanmış API sözleşmesi verilecek. Henüz uygulanmamış API'ler çalışıyormuş gibi gösterilmeyecek.

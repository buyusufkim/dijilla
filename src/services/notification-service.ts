/**
 * Droto High-Conversion Notification Service
 * Generates urgent, persuasive notifications within 12-word limit.
 */

export type NotificationTrigger = 
  | 'insurance_expiry' 
  | 'high_risk_score' 
  | 'high_spending' 
  | 'missed_maintenance';

export interface DrotoNotification {
  title: string;
  body: string;
  cta: string;
  link: string;
}

export function generateNotification(trigger: NotificationTrigger, data?: any): DrotoNotification {
  switch (trigger) {
    case 'insurance_expiry':
      return {
        title: "Sigorta Uyarısı",
        body: "Sigortanız 14 günde bitiyor. Bugün yenileyin, %18 indirim kazanın.",
        cta: "Hemen Yenile",
        link: `/insurance-purchase/${data?.vehicleId}`
      };
    case 'high_risk_score':
      return {
        title: "Kritik Koruma",
        body: "Aracınız şu an korumasız. Tüm riskleri 2 dakikada çözün.",
        cta: "Riskleri Çöz",
        link: `/protection/${data?.vehicleId}`
      };
    case 'high_spending':
      return {
        title: "Maliyet Alarmı",
        body: "Yakında 15.000 TL masraf çıkabilir. Koruma seçeneklerini inceleyin.",
        cta: "Önlem Al",
        link: `/protection/${data?.vehicleId}`
      };
    case 'missed_maintenance':
      return {
        title: "Bakım Gecikmesi",
        body: "Bakım zamanı geçti. Öncelikli servis randevusu ile arızayı önleyin.",
        cta: "Randevu Al",
        link: `/maintenance`
      };
    default:
      return {
        title: "Droto Asistan",
        body: "Aracınızın finansal sağlığı için yeni bir güncelleme var.",
        cta: "İncele",
        link: "/garage"
      };
  }
}

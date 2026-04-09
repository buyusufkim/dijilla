export interface RiskAnalysis {
  healthScore: number; // 0-100 (inverse of risk)
  riskLevel: 'Low' | 'Medium' | 'High';
  predictedMaintenanceCost: number; // next 3 months
  predictedIssues: string[];
  triggers: string[];
  recommendedProducts: ProductOffer[];
  maintenanceRecommendations: MaintenanceRecommendation[];
  salesBlock: {
    urgentMessage: string;
    persuasivePoints: string[];
  };
}

export interface MaintenanceRecommendation {
  title: string;
  importance: string;
  riskIfIgnored: string;
  monetization: {
    type: 'service' | 'assistance' | 'coverage';
    suggestion: string;
    cta: string;
  };
}

export interface ProductOffer {
  id: string;
  type: 'insurance' | 'assistance' | 'premium';
  title: string;
  description: string;
  price: number;
  urgency: string;
  cta: string;
}

export function calculateRisk(vehicle: {
  year: number;
  mileage?: number;
  insurance_expiry: string;
  inspection_expiry: string;
  last_maintenance_date?: string;
}): RiskAnalysis {
  let riskScore = 0;
  const currentYear = new Date().getFullYear();
  const age = currentYear - vehicle.year;
  const mileage = vehicle.mileage || 0;

  // Age factor (up to 40 points)
  riskScore += Math.min(age * 4, 40);

  // Mileage factor (up to 30 points)
  riskScore += Math.min((mileage / 10000) * 2, 30);

  // Expiry factors (up to 30 points)
  const daysToInsurance = calculateDaysLeft(vehicle.insurance_expiry);
  const daysToInspection = calculateDaysLeft(vehicle.inspection_expiry);

  if (daysToInsurance < 30) riskScore += 20;
  else if (daysToInsurance < 60) riskScore += 10;
  
  if (daysToInspection < 30) riskScore += 10;

  // Maintenance factor
  if (vehicle.last_maintenance_date) {
    const monthsSinceMaintenance = (new Date().getTime() - new Date(vehicle.last_maintenance_date).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceMaintenance > 12) riskScore += 10;
  } else {
    riskScore += 15; // No record is risky
  }

  const finalRiskScore = Math.min(riskScore, 100);
  const healthScore = 100 - finalRiskScore;

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (finalRiskScore > 70) riskLevel = 'High';
  else if (finalRiskScore > 40) riskLevel = 'Medium';

  const predictedMaintenanceCost = (age > 10 ? 5000 : 2000) + (mileage > 100000 ? 3000 : 1000);

  const predictedIssues: string[] = [];
  if (age > 8) predictedIssues.push('Akü ve Elektrik Sistemi Yorgunluğu');
  if (mileage > 120000) predictedIssues.push('Triger Seti ve Ağır Bakım İhtiyacı');
  if (daysToInsurance < 30) predictedIssues.push('Yasal Güvence Kaybı Riski');
  if (predictedIssues.length === 0) predictedIssues.push('Rutin Filtre ve Sıvı Değişimleri');

  const triggers: string[] = [];
  if (daysToInsurance < 30) triggers.push('Insurance Expiry Imminent');
  if (age > 10) triggers.push('High Vehicle Age Risk');

  const salesBlock = {
    urgentMessage: daysToInsurance < 30 
      ? "Poliçenizin bitmesine günler kaldı, yasal risk altındasınız!" 
      : riskLevel === 'High' 
        ? "Aracınızın risk profili yükseldi, beklenmedik maliyetlere hazır mısınız?" 
        : "Aracınızın değerini korumak için şimdi harekete geçin.",
    persuasivePoints: [
      riskLevel === 'High' ? "Yol yardım paketi ile çekici maliyetinden ₺2.500 tasarruf edin." : "Düzenli bakım ile yakıt tüketimini %15'e kadar düşürün.",
      "Droto özel indirimiyle kasko poliçenizde ₺1.200'ye varan avantaj sağlayın."
    ]
  };

  const recommendedProducts: ProductOffer[] = [];

  const maintenanceRecommendations: MaintenanceRecommendation[] = [];

  if (age > 5 || mileage > 80000) {
    maintenanceRecommendations.push({
      title: 'Fren Sistemi Kontrolü',
      importance: 'Durdurma gücünü korur ve disk hasarını önler.',
      riskIfIgnored: '₺12.000 fren arızası vs ₺1.500 balata değişimi.',
      monetization: {
        type: 'service',
        suggestion: 'Hemen öncelikli servis randevusu alın.',
        cta: 'Randevu Al'
      }
    });
  }

  if (age > 8 || mileage > 120000) {
    maintenanceRecommendations.push({
      title: 'Akü Sağlık Optimizasyonu',
      importance: 'Soğuk havalarda beklenmedik marş sorunlarını önler.',
      riskIfIgnored: '₺3.000 çekici + ₺4.500 akü vs ₺3.500 proaktif değişim.',
      monetization: {
        type: 'assistance',
        suggestion: 'Gold Yol Yardım paketi ile kendinizi güvenceye alın.',
        cta: 'Paketi İncele'
      }
    });
  }

  if (daysToInsurance < 45) {
    recommendedProducts.push({
      id: 'ins_01',
      type: 'insurance',
      title: 'Kapsamlı Kasko Paketi',
      description: 'En iyi fiyat garantisi ve Droto özel indirimiyle hemen yenileyin.',
      price: 4250,
      urgency: 'Fiyat Garantisi!',
      cta: 'Teklif Al'
    });
  }

  if (riskLevel !== 'Low') {
    recommendedProducts.push({
      id: 'ast_01',
      type: 'assistance',
      title: 'Gold Yol Yardım',
      description: 'Sınırsız çekici, ikame araç ve yerinde onarım hizmeti.',
      price: 950,
      urgency: 'En Çok Tercih Edilen',
      cta: 'Hemen Koru'
    });
  }

  return {
    healthScore,
    riskLevel,
    predictedMaintenanceCost,
    predictedIssues,
    triggers,
    recommendedProducts,
    maintenanceRecommendations,
    salesBlock
  };
}

function calculateDaysLeft(dateString: string) {
  if (!dateString) return 365;
  const expiry = new Date(dateString);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

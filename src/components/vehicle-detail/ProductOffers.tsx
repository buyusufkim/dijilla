import React from "react";
import { Tag, ShieldCheck, Wrench, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductOffer } from "@/lib/risk-engine";

interface ProductOffersProps {
  offers: ProductOffer[];
}

export const ProductOffers: React.FC<ProductOffersProps> = ({ offers }) => {
  if (offers.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Tag className="w-5 h-5 text-[#FFD600]" />
        Önerilen Koruma Paketleri
      </h3>
      <div className="space-y-3">
        {offers.map(offer => (
          <Card key={offer.id} className="bg-gradient-to-r from-[#1A233A] to-[#0A1128] border-[#FFD600]/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2">
              <span className="bg-[#FFD600] text-[#0A1128] text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {offer.urgency}
              </span>
            </div>
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD600]/10 flex items-center justify-center">
                  {offer.type === 'insurance' ? <ShieldCheck className="w-6 h-6 text-[#FFD600]" /> : 
                   offer.type === 'assistance' ? <Wrench className="w-6 h-6 text-[#FFD600]" /> : 
                   <Tag className="w-6 h-6 text-[#FFD600]" />}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{offer.title}</h4>
                  <p className="text-sm text-white/60">{offer.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                <div className="text-right">
                  <p className="text-xs text-white/40 line-through">₺{(offer.price * 1.2).toLocaleString('tr-TR')}</p>
                  <p className="text-xl font-bold text-[#00E676]">₺{offer.price.toLocaleString('tr-TR')}</p>
                </div>
                <Button className="bg-[#FFD600] text-[#0A1128] hover:bg-[#FFC400] font-bold gap-2">
                  {offer.cta}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

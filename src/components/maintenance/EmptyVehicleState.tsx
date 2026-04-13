import React from "react";
import { Car } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const EmptyVehicleState: React.FC = () => {
  return (
    <Card className="bg-[#1A233A] border-white/10 p-12 text-center">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
        <Car className="w-8 h-8 text-white/20" />
      </div>
      <h3 className="text-xl font-bold mb-2">Henüz Araç Yok</h3>
      <p className="text-white/50 mb-6">Bakım planlamak için önce garajınıza bir araç ekleyin.</p>
      <Button onClick={() => window.location.href = "/garage"} className="bg-[#00E5FF] text-[#0A1128]">
        Garaja Git
      </Button>
    </Card>
  );
};

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceItem } from "./types";

interface ServiceCardProps {
  item: ServiceItem;
  onClick: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ item, onClick }) => {
  return (
    <Card
      onClick={onClick}
      className="bg-[#1A233A] border-white/5 hover:border-white/20 transition-all cursor-pointer group h-full"
    >
      <CardContent className="p-6 flex flex-col h-full">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.bg} mb-4 group-hover:scale-110 transition-transform shrink-0`}
        >
          <item.icon
            className={`w-7 h-7 ${item.color}`}
            strokeWidth={2}
          />
        </div>
        <h3 className="font-bold text-lg mb-1">{item.label}</h3>
        <p className="text-sm text-white/50">{item.desc}</p>
      </CardContent>
    </Card>
  );
};

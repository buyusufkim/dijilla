import {
  Shield,
  FileText,
  Wrench,
  HeartPulse,
  FileSignature,
  Calendar,
  Fuel,
  BarChart3,
  Bot,
} from "lucide-react";
import { ServiceCategory } from "./types";

export const categories: ServiceCategory[] = [
  {
    title: "Acil & Sağlık",
    items: [
      {
        icon: HeartPulse,
        label: "Nöbetçi Eczane",
        color: "text-[#FF3D00]",
        bg: "bg-[#FF3D00]/10",
        desc: "En yakın nöbetçi eczaneyi bulun.",
      },
      {
        icon: Shield,
        label: "Anlaşmalı Hastane",
        color: "text-[#00E5FF]",
        bg: "bg-[#00E5FF]/10",
        desc: "Poliçenize uygun hastaneler.",
      },
    ],
  },
  {
    title: "Resmi İşlemler",
    items: [
      {
        icon: FileSignature,
        label: "Nöbetçi Noter",
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        desc: "Hafta sonu açık noterler.",
      },
      {
        icon: FileText,
        label: "MTV Ödeme",
        color: "text-[#00E676]",
        bg: "bg-[#00E676]/10",
        desc: "Tek tıkla vergi ödemesi.",
      },
      {
        icon: FileText,
        label: "Trafik Cezası",
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        desc: "Ceza sorgulama ve ödeme.",
      },
      {
        icon: FileText,
        label: "Kaza Tutanağı",
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        desc: "Online e-tutanak doldurun.",
      },
    ],
  },
  {
    title: "Araç Bakım",
    items: [
      {
        icon: Calendar,
        label: "Bakım Planlama",
        color: "text-[#00E5FF]",
        bg: "bg-[#00E5FF]/10",
        desc: "Aracınızın bakım takvimini yönetin.",
        link: "/maintenance"
      },
      {
        icon: Wrench,
        label: "Oto Servisler",
        color: "text-orange-400",
        bg: "bg-orange-400/10",
        desc: "Anlaşmalı bakım noktaları.",
      },
      {
        icon: Calendar,
        label: "Muayene Randevusu",
        color: "text-pink-400",
        bg: "bg-pink-400/10",
        desc: "TÜVTÜRK randevusu alın.",
      },
    ],
  },
  {
    title: "Akıllı Yönetim",
    items: [
      {
        icon: FileText,
        label: "Dijital Torpido",
        color: "text-[#00E5FF]",
        bg: "bg-[#00E5FF]/10",
        desc: "Belgelerinizi dijital ortamda saklayın.",
        link: "/glovebox"
      },
      {
        icon: Fuel,
        label: "Yakıt & Şarj",
        color: "text-[#FFD600]",
        bg: "bg-[#FFD600]/10",
        desc: "En uygun istasyonları bulun.",
        link: "/fuel"
      },
      {
        icon: BarChart3,
        label: "Gider Takibi",
        color: "text-[#00E676]",
        bg: "bg-[#00E676]/10",
        desc: "Harcamalarınızı analiz edin.",
        link: "/expenses"
      },
      {
        icon: Bot,
        label: "AI Teşhis",
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        desc: "Yapay zeka ile arıza teşhisi.",
        link: "/ai-assistant"
      },
    ],
  },
];

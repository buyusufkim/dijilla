import { LucideIcon } from "lucide-react";

export interface ServiceItem {
  icon: LucideIcon;
  label: string;
  color: string;
  bg: string;
  desc: string;
  link?: string;
}

export interface ServiceCategory {
  title: string;
  items: ServiceItem[];
}

export interface Place {
  id: number | string;
  name: string;
  addr: string;
  dist: number;
  lat: number;
  lon: number;
}

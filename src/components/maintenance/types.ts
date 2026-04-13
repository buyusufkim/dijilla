export interface Vehicle {
  id: string;
  plate: string;
  [key: string]: any;
}

export interface MaintenanceRecord {
  id: string;
  service_type: string;
  date: string;
  mileage: number;
  cost: number;
  notes?: string;
  [key: string]: any;
}

export interface MaintenanceAppointment {
  id: string;
  service_type: string;
  appointment_date: string;
  location: string;
  [key: string]: any;
}

export interface Recommendation {
  service: string;
  interval_km: number;
  interval_months: number;
  description: string;
}

export type Vehicle = {
  id: string;
  plate: string;
  brand_model: string;
  brand?: string;
  model?: string;
  year: number;
  mileage?: number;
  fuel_type?: string;
  insurance_expiry: string;
  inspection_expiry: string;
  tax_status: string;
};

export type MaintenanceRecord = {
  id: string;
  service_type: string;
  mileage: number;
  date: string;
  cost: number;
  notes: string;
  is_appointment?: boolean;
};

export type Appointment = {
  id: string;
  service_type: string;
  appointment_date: string;
  location: string;
  status: string;
  cost?: number;
  notes?: string;
};

export type Reminder = {
  id: string;
  title: string;
  date: string;
  vehicle_id: string;
  user_id: string;
  completed: boolean;
};

export const calculateDaysLeft = (dateString: string) => {
  if (!dateString) return 0;
  const expiry = new Date(dateString);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

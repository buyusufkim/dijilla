export type Vehicle = {
  id: string;
  plate: string;
  brand_model: string;
  brand?: string;
  model?: string;
  year: number;
  mileage?: number;
  insurance_expiry: string;
  inspection_expiry: string;
  tax_status: string;
};

export type HomeAsset = {
  id: string;
  name: string;
  address: string;
};

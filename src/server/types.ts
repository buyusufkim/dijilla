export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      quote_requests: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          status: string
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          vehicle_id: string
          status?: string
          type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string
          status?: string
          type?: string
          created_at?: string
          updated_at?: string
        }
      }
      normalized_offers: {
        Row: {
          id: string
          quote_request_id: string
          provider_id: string
          provider_name: string
          premium: number
          currency: string
          coverage_details: Json
          status: string
          is_demo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          quote_request_id: string
          provider_id: string
          provider_name: string
          premium: number
          currency: string
          coverage_details: Json
          status?: string
          is_demo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          quote_request_id?: string
          provider_id?: string
          provider_name?: string
          premium?: number
          currency?: string
          coverage_details?: Json
          status?: string
          is_demo?: boolean
          created_at?: string
        }
      }
      provider_requests: {
        Row: {
          id: string
          quote_request_id: string
          provider_id: string
          status: string
          raw_response: Json | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          quote_request_id: string
          provider_id: string
          status?: string
          raw_response?: Json | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          quote_request_id?: string
          provider_id?: string
          status?: string
          raw_response?: Json | null
          error_message?: string | null
          created_at?: string
        }
      }
      policies: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          checkout_id: string | null
          policy_number: string
          provider: string
          type: string
          start_date: string
          end_date: string
          premium: number
          document_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id: string
          checkout_id?: string | null
          policy_number: string
          provider: string
          type: string
          start_date: string
          end_date: string
          premium: number
          document_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string
          checkout_id?: string | null
          policy_number?: string
          provider?: string
          type?: string
          start_date?: string
          end_date?: string
          premium?: number
          document_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      checkouts: {
        Row: {
          id: string
          user_id: string
          offer_id: string
          amount: number
          status: string
          payment_details: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          offer_id: string
          amount: number
          status?: string
          payment_details?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          offer_id?: string
          amount?: number
          status?: string
          payment_details?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          role: string | null
          avatar_url: string | null
          points: number
          notification_settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          role?: string | null
          avatar_url?: string | null
          points?: number
          notification_settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          role?: string | null
          avatar_url?: string | null
          points?: number
          notification_settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          user_id: string
          plate: string
          brand_model: string
          year: number | null
          fuel_type: string | null
          mileage: number | null
          insurance_expiry: string | null
          inspection_expiry: string | null
          tax_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plate: string
          brand_model: string
          year?: number | null
          fuel_type?: string | null
          mileage?: number | null
          insurance_expiry?: string | null
          inspection_expiry?: string | null
          tax_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plate?: string
          brand_model?: string
          year?: number | null
          fuel_type?: string | null
          mileage?: number | null
          insurance_expiry?: string | null
          inspection_expiry?: string | null
          tax_status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      homes: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string | null
          type: string
          title: string
          expiry_date: string | null
          status: string
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id?: string | null
          type: string
          title: string
          expiry_date?: string | null
          status?: string
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string | null
          type?: string
          title?: string
          expiry_date?: string | null
          status?: string
          file_url?: string | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string | null
          category: string
          title: string
          amount: number
          expense_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id?: string | null
          category: string
          title: string
          amount: number
          expense_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string | null
          category?: string
          title?: string
          amount?: number
          expense_date?: string
          created_at?: string
        }
      }
      maintenance_records: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          service_type: string
          date: string
          mileage: number | null
          cost: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id: string
          service_type: string
          date: string
          mileage?: number | null
          cost?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string
          service_type?: string
          date?: string
          mileage?: number | null
          cost?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          service_type: string
          appointment_date: string
          location: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id: string
          service_type: string
          appointment_date: string
          location?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string
          service_type?: string
          appointment_date?: string
          location?: string | null
          status?: string
          created_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          title: string
          date: string
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id: string
          title: string
          date: string
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string
          title?: string
          date?: string
          completed?: boolean
          created_at?: string
        }
      }
      service_requests: {
        Row: {
          id: string
          user_id: string
          type: string
          plate: string | null
          phone: string
          location_address: string | null
          destination: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          plate?: string | null
          phone: string
          location_address?: string | null
          destination?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          plate?: string | null
          phone?: string
          location_address?: string | null
          destination?: string | null
          status?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: any
  }
}

export enum QuoteType {
  TRAFFIC = "traffic",
  CASCO = "casco"
}

export enum QuoteStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  PARTIAL = "partial",
  COMPLETED = "completed",
  FAILED = "failed"
}

export enum CheckoutStatus {
  PENDING = "pending",
  PAYMENT_PROCESSING = "payment_processing",
  PAID = "paid",
  FAILED = "failed",
  EXPIRED = "expired"
}

export interface VehicleDTO {
  id: string
  user_id: string
  plate: string
  brand_model: string
  year: number | null
  fuel_type: string | null
  mileage: number | null
  insurance_expiry: string | null
  inspection_expiry: string | null
  tax_status: string | null
  created_at: string
}

export interface QuoteRequestDTO {
  id: string
  user_id: string | null
  vehicle_id: string
  status: string
  created_at: string
}

export interface NormalizedOfferDTO {
  id: string
  quote_request_id: string
  provider_id: string
  provider_name: string
  premium: number
  currency: string
  coverage_details: any
  status: string
  created_at: string
}

export interface CheckoutDTO {
  id: string
  user_id: string
  offer_id: string
  amount: number
  status: string
  created_at: string
}

export interface PolicyDTO {
  id: string
  user_id: string
  vehicle_id: string
  policy_number: string
  provider: string
  type: string
  start_date: string
  end_date: string
  premium: number
  document_url: string | null
  status: string
  created_at: string
}

export interface IProviderAdapter {
  providerId: string
  providerName: string
  getQuotes(quoteRequest: any, vehicle: any): Promise<any[]>
}

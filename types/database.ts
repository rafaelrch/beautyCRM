// Tipos TypeScript gerados a partir do schema do Supabase
// Estes tipos correspondem às tabelas criadas no schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          salon_name: string | null
          cnpj: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          salon_name?: string | null
          cnpj?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          salon_name?: string | null
          cnpj?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string | null
          email: string | null
          birthdate: string | null
          address: string | null
          cpf: string | null
          registration_date: string
          last_visit: string | null
          total_spent: number
          total_visits: number
          notes: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone?: string | null
          email?: string | null
          birthdate?: string | null
          address?: string | null
          cpf?: string | null
          registration_date?: string
          last_visit?: string | null
          total_spent?: number
          total_visits?: number
          notes?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          birthdate?: string | null
          address?: string | null
          cpf?: string | null
          registration_date?: string
          last_visit?: string | null
          total_spent?: number
          total_visits?: number
          notes?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      professionals: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string | null
          email: string | null
          specialties: string[]
          color: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone?: string | null
          email?: string | null
          specialties?: string[]
          color?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          specialties?: string[]
          color?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          user_id: string
          name: string
          category: 'hair' | 'nails' | 'aesthetics' | 'makeup' | 'massage'
          duration: number
          price: number
          description: string | null
          professional_ids: string[]
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: 'hair' | 'nails' | 'aesthetics' | 'makeup' | 'massage'
          duration: number
          price: number
          description?: string | null
          professional_ids?: string[]
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: 'hair' | 'nails' | 'aesthetics' | 'makeup' | 'massage'
          duration?: number
          price?: number
          description?: string | null
          professional_ids?: string[]
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          quantity: number
          min_quantity: number
          unit: string
          cost_price: number
          sale_price: number
          supplier: string | null
          last_purchase: string | null
          expiration_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          quantity?: number
          min_quantity?: number
          unit?: string
          cost_price: number
          sale_price: number
          supplier?: string | null
          last_purchase?: string | null
          expiration_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          quantity?: number
          min_quantity?: number
          unit?: string
          cost_price?: number
          sale_price?: number
          supplier?: string | null
          last_purchase?: string | null
          expiration_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          client_id: string
          professional_id: string
          service_ids: string[]
          date: string
          start_time: string
          end_time: string
          status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          professional_id: string
          service_ids?: string[]
          date: string
          start_time: string
          end_time: string
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          professional_id?: string
          service_ids?: string[]
          date?: string
          start_time?: string
          end_time?: string
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          date: string
          type: 'income' | 'expense'
          category: string
          description: string
          amount: number
          payment_method: 'cash' | 'credit' | 'debit' | 'pix'
          client_id: string | null
          service_ids: string[]
          product_id: string | null
          quantity: number | null
          discount_percentage: number | null
          non_registered_client_name: string | null
          professional_id: string | null
          status: 'completed' | 'pending' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          type: 'income' | 'expense'
          category: string
          description: string
          amount: number
          payment_method: 'cash' | 'credit' | 'debit' | 'pix'
          client_id?: string | null
          service_ids?: string[]
          product_id?: string | null
          quantity?: number | null
          discount_percentage?: number | null
          non_registered_client_name?: string | null
          professional_id?: string | null
          status?: 'completed' | 'pending' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          type?: 'income' | 'expense'
          category?: string
          description?: string
          amount?: number
          payment_method?: 'cash' | 'credit' | 'debit' | 'pix'
          client_id?: string | null
          service_ids?: string[]
          product_id?: string | null
          quantity?: number | null
          discount_percentage?: number | null
          non_registered_client_name?: string | null
          professional_id?: string | null
          status?: 'completed' | 'pending' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      stock_movements: {
        Row: {
          id: string
          user_id: string
          product_id: string
          type: 'in' | 'out'
          quantity: number
          date: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          type: 'in' | 'out'
          quantity: number
          date: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          type?: 'in' | 'out'
          quantity?: number
          date?: string
          reason?: string | null
          created_at?: string
        }
      }
      salon_config: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          cnpj: string | null
          logo: string | null
          business_hours: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          cnpj?: string | null
          logo?: string | null
          business_hours?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          cnpj?: string | null
          logo?: string | null
          business_hours?: Json
          created_at?: string
          updated_at?: string
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





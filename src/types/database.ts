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
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          timezone: string
          plan: 'free' | 'pro' | 'pro_plus'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          ai_usage_count: number
          ai_usage_reset_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          timezone?: string
          plan?: 'free' | 'pro' | 'pro_plus'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          ai_usage_count?: number
          ai_usage_reset_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          timezone?: string
          plan?: 'free' | 'pro' | 'pro_plus'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          ai_usage_count?: number
          ai_usage_reset_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: 'programming' | 'language' | 'certification' | 'other'
          target_date: string | null
          target_hours: number | null
          status: 'active' | 'completed' | 'paused' | 'archived'
          progress_percent: number
          color: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: 'programming' | 'language' | 'certification' | 'other'
          target_date?: string | null
          target_hours?: number | null
          status?: 'active' | 'completed' | 'paused' | 'archived'
          progress_percent?: number
          color?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: 'programming' | 'language' | 'certification' | 'other'
          target_date?: string | null
          target_hours?: number | null
          status?: 'active' | 'completed' | 'paused' | 'archived'
          progress_percent?: number
          color?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      milestones: {
        Row: {
          id: string
          goal_id: string
          title: string
          description: string | null
          target_date: string | null
          is_completed: boolean
          completed_at: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          title: string
          description?: string | null
          target_date?: string | null
          is_completed?: boolean
          completed_at?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          title?: string
          description?: string | null
          target_date?: string | null
          is_completed?: boolean
          completed_at?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      study_logs: {
        Row: {
          id: string
          user_id: string
          goal_id: string
          duration_minutes: number
          study_date: string
          note: string | null
          mood: 'great' | 'good' | 'neutral' | 'difficult' | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id: string
          duration_minutes: number
          study_date?: string
          note?: string | null
          mood?: 'great' | 'good' | 'neutral' | 'difficult' | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string
          duration_minutes?: number
          study_date?: string
          note?: string | null
          mood?: 'great' | 'good' | 'neutral' | 'difficult' | null
          created_at?: string
        }
      }
      ai_plans: {
        Row: {
          id: string
          user_id: string
          goal_id: string
          title: string
          prompt_used: string
          raw_response: string
          total_days: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id: string
          title: string
          prompt_used: string
          raw_response: string
          total_days?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string
          title?: string
          prompt_used?: string
          raw_response?: string
          total_days?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
      ai_plan_items: {
        Row: {
          id: string
          plan_id: string
          day_number: number
          title: string
          description: string | null
          estimated_minutes: number | null
          is_completed: boolean
          completed_at: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          plan_id: string
          day_number: number
          title: string
          description?: string | null
          estimated_minutes?: number | null
          is_completed?: boolean
          completed_at?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          plan_id?: string
          day_number?: number
          title?: string
          description?: string | null
          estimated_minutes?: number | null
          is_completed?: boolean
          completed_at?: string | null
          sort_order?: number
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'pro' | 'pro_plus'
          status: 'active' | 'canceled' | 'past_due'
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan: 'pro' | 'pro_plus'
          status: 'active' | 'canceled' | 'past_due'
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'pro' | 'pro_plus'
          status?: 'active' | 'canceled' | 'past_due'
          current_period_start?: string | null
          current_period_end?: string | null
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

// 便利な型エイリアス
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type Milestone = Database['public']['Tables']['milestones']['Row']
export type StudyLog = Database['public']['Tables']['study_logs']['Row']
export type AIPlan = Database['public']['Tables']['ai_plans']['Row']
export type AIPlanItem = Database['public']['Tables']['ai_plan_items']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']

export type GoalInsert = Database['public']['Tables']['goals']['Insert']
export type GoalUpdate = Database['public']['Tables']['goals']['Update']
export type StudyLogInsert = Database['public']['Tables']['study_logs']['Insert']
export type MilestoneInsert = Database['public']['Tables']['milestones']['Insert']

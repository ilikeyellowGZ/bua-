export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamp = string;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          language_code: string;
          goal: 'colleagues' | 'family' | 'campus' | 'everyday' | null;
          daily_goal_minutes: number;
          streak_days: number;
          total_xp: number;
          longest_streak_days: number;
          last_activity_local_date: string | null;
          onboarding_completed: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id: string;
          display_name: string;
          language_code?: string;
          goal?: 'colleagues' | 'family' | 'campus' | 'everyday' | null;
          daily_goal_minutes?: number;
          streak_days?: number;
          total_xp?: number;
          longest_streak_days?: number;
          last_activity_local_date?: string | null;
          onboarding_completed?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          language_code: string;
          language_name: string;
          title: string;
          published: boolean;
          content_version: number;
          created_at: Timestamp;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      units: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          sort_order: number;
          published: boolean;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          unit_id: string;
          title: string;
          duration_minutes: number;
          level: 'Beginner' | 'Intermediate' | 'Advanced';
          sort_order: number;
          published: boolean;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          lesson_id: string;
          kind: string;
          sort_order: number;
          required: boolean;
          content: Json;
          published: boolean;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      lesson_runs: {
        Row: {
          id: string;
          owner_id: string;
          lesson_id: string;
          status: 'active' | 'paused' | 'completed' | 'abandoned';
          current_activity_id: string | null;
          started_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id: string;
          owner_id: string;
          lesson_id: string;
          status: 'active' | 'paused' | 'completed' | 'abandoned';
          current_activity_id?: string | null;
          started_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database['public']['Tables']['lesson_runs']['Insert']>;
        Relationships: [];
      };
      attempts: {
        Row: {
          id: string;
          owner_id: string;
          lesson_run_id: string;
          activity_id: string;
          status: string;
          answer: Json | null;
          score: number | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id: string;
          owner_id: string;
          lesson_run_id: string;
          activity_id: string;
          status: string;
          answer?: Json | null;
          score?: number | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database['public']['Tables']['attempts']['Insert']>;
        Relationships: [];
      };
      lesson_completions: {
        Row: {
          id: string;
          owner_id: string;
          lesson_run_id: string;
          lesson_id: string;
          active_learning_seconds: number;
          completed_at: Timestamp;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      reminders: {
        Row: {
          id: string;
          owner_id: string;
          local_time: string;
          time_zone: string;
          enabled: boolean;
          updated_at: Timestamp;
        };
        Insert: {
          id: string;
          owner_id: string;
          local_time: string;
          time_zone: string;
          enabled?: boolean;
          updated_at?: Timestamp;
        };
        Update: Partial<Database['public']['Tables']['reminders']['Insert']>;
        Relationships: [];
      };
      sync_operations: {
        Row: {
          id: string;
          owner_id: string;
          kind: string;
          aggregate_id: string;
          payload: Json;
          status: string;
          attempt_count: number;
          next_attempt_at: Timestamp;
          created_at: Timestamp;
          acknowledged_at: Timestamp | null;
        };
        Insert: {
          id: string;
          owner_id: string;
          kind: string;
          aggregate_id: string;
          payload: Json;
        };
        Update: never;
        Relationships: [];
      };
      entitlements: {
        Row: {
          id: string;
          owner_id: string;
          product_id: string;
          status: string;
          source: string;
          valid_until: Timestamp | null;
          verified_at: Timestamp;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      institution_memberships: {
        Row: {
          id: string;
          owner_id: string;
          institution_id: string;
          role: string;
          verified_at: Timestamp;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      progress_events: {
        Row: {
          id: string;
          owner_id: string;
          xp_awarded: number;
          current_streak_days: number;
          longest_streak_days: number;
          last_activity_local_date: string;
          created_at: Timestamp;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      review_schedule: {
        Row: {
          owner_id: string;
          item_id: string;
          next_review_at: Timestamp;
          interval_days: number;
          ease_factor: number;
          repetitions: number;
          updated_at: Timestamp;
        };
        Insert: {
          owner_id: string;
          item_id: string;
          next_review_at: Timestamp;
          interval_days: number;
          ease_factor: number;
          repetitions?: number;
          updated_at?: Timestamp;
        };
        Update: Partial<Database['public']['Tables']['review_schedule']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      complete_lesson_once: {
        Args: {
          p_completion_id: string;
          p_lesson_run_id: string;
          p_lesson_id: string;
          p_active_learning_seconds: number;
          p_completed_at?: Timestamp;
        };
        Returns: Database['public']['Tables']['lesson_completions']['Row'];
      };
      ack_sync_operation: { Args: { p_operation_id: string }; Returns: boolean };
      apply_progress_update: {
        Args: {
          p_event_id: string;
          p_xp_awarded: number;
          p_current_streak_days: number;
          p_longest_streak_days: number;
          p_last_activity_local_date: string;
        };
        Returns: Database['public']['Tables']['profiles']['Row'];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

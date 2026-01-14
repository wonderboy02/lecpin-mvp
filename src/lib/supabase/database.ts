export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      competencies: {
        Row: {
          created_at: string | null
          description: string
          id: string
          lecture_id: string
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          lecture_id: string
          name: string
          order_index?: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          lecture_id?: string
          name?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "competencies_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          code_quality: Json
          created_at: string | null
          grade: string
          id: string
          improvements: Json
          next_steps: string[]
          overall_score: number
          strengths: Json
          submission_id: string
          summary: string
        }
        Insert: {
          code_quality?: Json
          created_at?: string | null
          grade: string
          id?: string
          improvements?: Json
          next_steps?: string[]
          overall_score: number
          strengths?: Json
          submission_id: string
          summary: string
        }
        Update: {
          code_quality?: Json
          created_at?: string | null
          grade?: string
          id?: string
          improvements?: Json
          next_steps?: string[]
          overall_score?: number
          strengths?: Json
          submission_id?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      lectures: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          error_message: string | null
          file_path: string | null
          id: string
          language: string | null
          platform: string | null
          source_type: string
          source_url: string | null
          status: string
          thumbnail_url: string | null
          title: string
          transcript: string | null
          updated_at: string | null
          user_id: string | null
          youtube_id: string | null
          youtube_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          language?: string | null
          platform?: string | null
          source_type: string
          source_url?: string | null
          status?: string
          thumbnail_url?: string | null
          title: string
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
          youtube_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          language?: string | null
          platform?: string | null
          source_type?: string
          source_url?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
          youtube_id?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lectures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          created_at: string | null
          description: string | null
          file_path: string
          github_repo_url: string | null
          id: string
          status: string
          submission_type: string | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_path: string
          github_repo_url?: string | null
          id?: string
          status?: string
          submission_type?: string | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_path?: string
          github_repo_url?: string | null
          id?: string
          status?: string
          submission_type?: string | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          boilerplate_url: string | null
          created_at: string | null
          description: string
          difficulty: string
          estimated_time: string
          github_repo_url: string | null
          id: string
          lecture_id: string
          reason: string
          steps: Json
          success_criteria: string[]
          tech_stack: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          boilerplate_url?: string | null
          created_at?: string | null
          description: string
          difficulty: string
          estimated_time: string
          github_repo_url?: string | null
          id?: string
          lecture_id: string
          reason: string
          steps?: Json
          success_criteria?: string[]
          tech_stack?: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          boilerplate_url?: string | null
          created_at?: string | null
          description?: string
          difficulty?: string
          estimated_time?: string
          github_repo_url?: string | null
          id?: string
          lecture_id?: string
          reason?: string
          steps?: Json
          success_criteria?: string[]
          tech_stack?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tasks: {
        Row: {
          created_at: string | null
          current_step: string
          feedback_id: string | null
          id: string
          lecture_id: string
          status: string
          submission_id: string | null
          task_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_step?: string
          feedback_id?: string | null
          id?: string
          lecture_id: string
          status?: string
          submission_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_step?: string
          feedback_id?: string | null
          id?: string
          lecture_id?: string
          status?: string
          submission_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedbacks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "lectures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          github_token: string | null
          github_username: string | null
          id: string
          name: string | null
          onboarding_completed: boolean | null
          preferred_language: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          github_token?: string | null
          github_username?: string | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          preferred_language?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          github_token?: string | null
          github_username?: string | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          preferred_language?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

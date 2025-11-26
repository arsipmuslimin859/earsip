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
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          name: string
          enabled: boolean
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          enabled?: boolean
          config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          enabled?: boolean
          config?: Json
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          icon: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          icon?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          icon?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      archives: {
        Row: {
          id: string
          title: string
          description: string | null
          category_id: string | null
          file_path: string
          file_name: string
          file_size: number
          file_type: string | null
          is_public: boolean
          version: number
          parent_version_id: string | null
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category_id?: string | null
          file_path: string
          file_name: string
          file_size?: number
          file_type?: string | null
          is_public?: boolean
          version?: number
          parent_version_id?: string | null
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category_id?: string | null
          file_path?: string
          file_name?: string
          file_size?: number
          file_type?: string | null
          is_public?: boolean
          version?: number
          parent_version_id?: string | null
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      archive_metadata: {
        Row: {
          id: string
          archive_id: string
          field_name: string
          field_value: string | null
          field_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          archive_id: string
          field_name: string
          field_value?: string | null
          field_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          archive_id?: string
          field_name?: string
          field_value?: string | null
          field_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      archive_tags: {
        Row: {
          id: string
          archive_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          archive_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          archive_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json
          created_at?: string
        }
      }
    }
  }
}

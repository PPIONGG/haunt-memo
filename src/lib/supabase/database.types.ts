
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "curator_allowlist": {
                  Row: {
                    "email": string
                  }
                  ComputedFields: never
                  Insert: {
                    "email": string
                  }
                  Update: {
                    "email"?: string
                  }
                  Relationships: [
                    
                  ]
                },"stories": {
                  Row: {
                    "added_at": string,"broadcast_date": string | null,"display_title": string,"id": string,"place": string | null,"province": string | null,"scare_level": number | null,"status": Database["public"]['Enums']["story_status"],"synopsis": string,"updated_at": string,"youtube_id": string,"youtube_title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "added_at"?: string,"broadcast_date"?: string | null,"display_title": string,"id"?: string,"place"?: string | null,"province"?: string | null,"scare_level"?: number | null,"status"?: Database["public"]['Enums']["story_status"],"synopsis"?: string,"updated_at"?: string,"youtube_id": string,"youtube_title": string
                  }
                  Update: {
                    "added_at"?: string,"broadcast_date"?: string | null,"display_title"?: string,"id"?: string,"place"?: string | null,"province"?: string | null,"scare_level"?: number | null,"status"?: Database["public"]['Enums']["story_status"],"synopsis"?: string,"updated_at"?: string,"youtube_id"?: string,"youtube_title"?: string
                  }
                  Relationships: [
                    
                  ]
                },"story_storytellers": {
                  Row: {
                    "story_id": string,"storyteller_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "story_id": string,"storyteller_id": string
                  }
                  Update: {
                    "story_id"?: string,"storyteller_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "story_storytellers_story_id_fkey"
      columns: ["story_id"]
isOneToOne: false
      referencedRelation: "stories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "story_storytellers_storyteller_id_fkey"
      columns: ["storyteller_id"]
isOneToOne: false
      referencedRelation: "storytellers"
      referencedColumns: ["id"]
    }
                  ]
                },"story_tags": {
                  Row: {
                    "story_id": string,"tag_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "story_id": string,"tag_id": string
                  }
                  Update: {
                    "story_id"?: string,"tag_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "story_tags_story_id_fkey"
      columns: ["story_id"]
isOneToOne: false
      referencedRelation: "stories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "story_tags_tag_id_fkey"
      columns: ["tag_id"]
isOneToOne: false
      referencedRelation: "tags"
      referencedColumns: ["id"]
    }
                  ]
                },"storytellers": {
                  Row: {
                    "id": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"name": string
                  }
                  Update: {
                    "id"?: string,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"tags": {
                  Row: {
                    "id": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"name": string
                  }
                  Update: {
                    "id"?: string,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "is_curator":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_published_story":
{ Args: { "p_story_id": string }; Returns: boolean
                           },
"merge_storytellers":
{ Args: { "p_source": string,"p_target": string }; Returns: undefined
                           },
"merge_tags":
{ Args: { "p_source": string,"p_target": string }; Returns: undefined
                           },
"require_curator":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"save_story":
{ Args: { "p_broadcast_date": string,"p_display_title": string,"p_id": string,"p_place": string,"p_province": string,"p_scare_level": number,"p_status": Database["public"]['Enums']["story_status"],"p_storytellers": (string)[],"p_synopsis": string,"p_tags": (string)[],"p_youtube_id": string,"p_youtube_title": string }; Returns: string
                           },
"thai_provinces":
{ Args: Record<PropertyKey, never>; Returns: (string)[]
                           }
          }
          Enums: {
            "story_status": "draft"|"published"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "story_status": ["draft", "published"]
          }
        }
} as const

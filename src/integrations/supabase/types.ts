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
      admin_logs: {
        Row: {
          acao: string
          admin_id: string
          created_at: string
          detalhes: Json | null
          id: string
        }
        Insert: {
          acao: string
          admin_id: string
          created_at?: string
          detalhes?: Json | null
          id?: string
        }
        Update: {
          acao?: string
          admin_id?: string
          created_at?: string
          detalhes?: Json | null
          id?: string
        }
        Relationships: []
      }
      assinaturas: {
        Row: {
          created_at: string
          estabelecimento_id: string
          fim: string | null
          id: string
          inicio: string
          plano_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estabelecimento_id: string
          fim?: string | null
          id?: string
          inicio?: string
          plano_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estabelecimento_id?: string
          fim?: string | null
          id?: string
          inicio?: string
          plano_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assinaturas_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assinaturas_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          avaliado_id: string
          avaliador_id: string
          candidatura_id: string
          comentario: string | null
          created_at: string
          id: string
          nota: number
        }
        Insert: {
          avaliado_id: string
          avaliador_id: string
          candidatura_id: string
          comentario?: string | null
          created_at?: string
          id?: string
          nota: number
        }
        Update: {
          avaliado_id?: string
          avaliador_id?: string
          candidatura_id?: string
          comentario?: string | null
          created_at?: string
          id?: string
          nota?: number
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_candidatura_id_fkey"
            columns: ["candidatura_id"]
            isOneToOne: false
            referencedRelation: "candidaturas"
            referencedColumns: ["id"]
          },
        ]
      }
      candidaturas: {
        Row: {
          created_at: string
          id: string
          profissional_id: string
          slot_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          profissional_id: string
          slot_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          profissional_id?: string
          slot_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidaturas_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidaturas_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidaturas_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          aceite_estabelecimento_at: string | null
          aceite_profissional_at: string | null
          created_at: string | null
          estabelecimento_id: string | null
          gerado_at: string | null
          id: string
          pdf_url: string
          profissional_id: string | null
          slot_id: string | null
          tipo: string
        }
        Insert: {
          aceite_estabelecimento_at?: string | null
          aceite_profissional_at?: string | null
          created_at?: string | null
          estabelecimento_id?: string | null
          gerado_at?: string | null
          id?: string
          pdf_url: string
          profissional_id?: string | null
          slot_id?: string | null
          tipo: string
        }
        Update: {
          aceite_estabelecimento_at?: string | null
          aceite_profissional_at?: string | null
          created_at?: string | null
          estabelecimento_id?: string | null
          gerado_at?: string | null
          id?: string
          pdf_url?: string
          profissional_id?: string | null
          slot_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      estabelecimentos: {
        Row: {
          cidade: string
          created_at: string
          endereco: string
          estado: string
          funcoes_utilizadas: string[] | null
          id: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          nome: string
          onboarding_completo: boolean
          responsavel: string
          telefone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cidade?: string
          created_at?: string
          endereco?: string
          estado?: string
          funcoes_utilizadas?: string[] | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          nome?: string
          onboarding_completo?: boolean
          responsavel?: string
          telefone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cidade?: string
          created_at?: string
          endereco?: string
          estado?: string
          funcoes_utilizadas?: string[] | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          nome?: string
          onboarding_completo?: boolean
          responsavel?: string
          telefone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      favoritos_profissionais: {
        Row: {
          created_at: string | null
          estabelecimento_id: string
          id: string
          profissional_id: string
        }
        Insert: {
          created_at?: string | null
          estabelecimento_id: string
          id?: string
          profissional_id: string
        }
        Update: {
          created_at?: string | null
          estabelecimento_id?: string
          id?: string
          profissional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_profissionais_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_profissionais_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_profissionais_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string
          id: string
          lida: boolean | null
          mensagem: string | null
          referencia_id: string | null
          tipo: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean | null
          mensagem?: string | null
          referencia_id?: string | null
          tipo?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean | null
          mensagem?: string | null
          referencia_id?: string | null
          tipo?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      ocorrencias_slots: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          profissional_id: string
          slot_id: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          profissional_id: string
          slot_id: string
          tipo: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          profissional_id?: string
          slot_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocorrencias_slots_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_slots_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_slots_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      planos: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          destaques: boolean
          exportar: boolean
          favoritos: boolean
          id: string
          limite_slots: number | null
          nome: string
          preco: number
          recorrencia: boolean
          relatorios: boolean
          slug: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          destaques?: boolean
          exportar?: boolean
          favoritos?: boolean
          id?: string
          limite_slots?: number | null
          nome: string
          preco?: number
          recorrencia?: boolean
          relatorios?: boolean
          slug: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          destaques?: boolean
          exportar?: boolean
          favoritos?: boolean
          id?: string
          limite_slots?: number | null
          nome?: string
          preco?: number
          recorrencia?: boolean
          relatorios?: boolean
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          is_blocked: boolean
          nome: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id: string
          is_blocked?: boolean
          nome?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          is_blocked?: boolean
          nome?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          certificacoes: string[] | null
          cidade: string
          created_at: string
          curriculo_url: string | null
          diaria_minima: number | null
          disponibilidade: string[] | null
          estado: string
          experiencia: string | null
          foto_url: string | null
          funcoes: string[] | null
          id: string
          idiomas: string[] | null
          instagram: string | null
          latitude: number | null
          linkedin: string | null
          longitude: number | null
          nome: string
          onboarding_completo: boolean
          portfolio: string | null
          raio_atuacao: number | null
          total_avaliacoes: number
          trust_score: number
          updated_at: string
          user_id: string
          whatsapp: string
          youtube: string | null
        }
        Insert: {
          certificacoes?: string[] | null
          cidade?: string
          created_at?: string
          curriculo_url?: string | null
          diaria_minima?: number | null
          disponibilidade?: string[] | null
          estado?: string
          experiencia?: string | null
          foto_url?: string | null
          funcoes?: string[] | null
          id?: string
          idiomas?: string[] | null
          instagram?: string | null
          latitude?: number | null
          linkedin?: string | null
          longitude?: number | null
          nome?: string
          onboarding_completo?: boolean
          portfolio?: string | null
          raio_atuacao?: number | null
          total_avaliacoes?: number
          trust_score?: number
          updated_at?: string
          user_id: string
          whatsapp?: string
          youtube?: string | null
        }
        Update: {
          certificacoes?: string[] | null
          cidade?: string
          created_at?: string
          curriculo_url?: string | null
          diaria_minima?: number | null
          disponibilidade?: string[] | null
          estado?: string
          experiencia?: string | null
          foto_url?: string | null
          funcoes?: string[] | null
          id?: string
          idiomas?: string[] | null
          instagram?: string | null
          latitude?: number | null
          linkedin?: string | null
          longitude?: number | null
          nome?: string
          onboarding_completo?: boolean
          portfolio?: string | null
          raio_atuacao?: number | null
          total_avaliacoes?: number
          trust_score?: number
          updated_at?: string
          user_id?: string
          whatsapp?: string
          youtube?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          chave: string
          descricao: string | null
          id: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          chave: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          chave?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: []
      }
      slots: {
        Row: {
          created_at: string
          data: string
          endereco: string | null
          estabelecimento_id: string
          funcao: string
          horario_fim: string
          horario_inicio: string
          id: string
          quantidade: number
          raio_notificacao: number | null
          status: string
          updated_at: string
          urgente: boolean
          valor: number
        }
        Insert: {
          created_at?: string
          data: string
          endereco?: string | null
          estabelecimento_id: string
          funcao: string
          horario_fim: string
          horario_inicio: string
          id?: string
          quantidade?: number
          raio_notificacao?: number | null
          status?: string
          updated_at?: string
          urgente?: boolean
          valor?: number
        }
        Update: {
          created_at?: string
          data?: string
          endereco?: string | null
          estabelecimento_id?: string
          funcao?: string
          horario_fim?: string
          horario_inicio?: string
          id?: string
          quantidade?: number
          raio_notificacao?: number | null
          status?: string
          updated_at?: string
          urgente?: boolean
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "slots_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      profissionais_publicos: {
        Row: {
          cidade: string | null
          estado: string | null
          foto_url: string | null
          funcoes: string[] | null
          id: string | null
          nome: string | null
          total_avaliacoes: number | null
          trust_score: number | null
        }
        Insert: {
          cidade?: string | null
          estado?: string | null
          foto_url?: string | null
          funcoes?: string[] | null
          id?: string | null
          nome?: string | null
          total_avaliacoes?: number | null
          trust_score?: number | null
        }
        Update: {
          cidade?: string | null
          estado?: string | null
          foto_url?: string | null
          funcoes?: string[] | null
          id?: string | null
          nome?: string | null
          total_avaliacoes?: number | null
          trust_score?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      create_notificacao: {
        Args: {
          p_mensagem?: string
          p_referencia_id?: string
          p_tipo?: string
          p_titulo: string
          p_user_id: string
        }
        Returns: string
      }
      delete_seed_data: { Args: never; Returns: undefined }
      estabelecimento_can_view_profissional: {
        Args: { _profissional_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_seed_data: { Args: never; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      setup_user_profile: {
        Args: {
          p_nome?: string
          p_role?: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      user_owns_profissional: {
        Args: { _profissional_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "estabelecimento" | "profissional"
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
    Enums: {
      app_role: ["admin", "estabelecimento", "profissional"],
    },
  },
} as const

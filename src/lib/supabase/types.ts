export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          area_hectares: number | null
          criado_em: string | null
          culturas: string[] | null
          documento: string
          id: string
          nome: string
          propriedade: string | null
          regiao: string | null
          tipo_pessoa: string
          vendedor_id: string | null
        }
        Insert: {
          area_hectares?: number | null
          criado_em?: string | null
          culturas?: string[] | null
          documento: string
          id?: string
          nome: string
          propriedade?: string | null
          regiao?: string | null
          tipo_pessoa: string
          vendedor_id?: string | null
        }
        Update: {
          area_hectares?: number | null
          criado_em?: string | null
          culturas?: string[] | null
          documento?: string
          id?: string
          nome?: string
          propriedade?: string | null
          regiao?: string | null
          tipo_pessoa?: string
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboradores: {
        Row: {
          cargo: string
          cpf: string
          criado_em: string | null
          data_admissao: string | null
          email: string | null
          id: string
          nome: string
          status: string
          supervisor_id: string | null
          telefone: string | null
          tipo_vinculo: string
          user_id: string | null
        }
        Insert: {
          cargo: string
          cpf: string
          criado_em?: string | null
          data_admissao?: string | null
          email?: string | null
          id?: string
          nome: string
          status?: string
          supervisor_id?: string | null
          telefone?: string | null
          tipo_vinculo: string
          user_id?: string | null
        }
        Update: {
          cargo?: string
          cpf?: string
          criado_em?: string | null
          data_admissao?: string | null
          email?: string | null
          id?: string
          nome?: string
          status?: string
          supervisor_id?: string | null
          telefone?: string | null
          tipo_vinculo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_colaborador: {
        Row: {
          arquivo_url: string | null
          colaborador_id: string
          criado_em: string | null
          data_emissao: string | null
          data_vencimento: string | null
          id: string
          tipo: string
        }
        Insert: {
          arquivo_url?: string | null
          colaborador_id: string
          criado_em?: string | null
          data_emissao?: string | null
          data_vencimento?: string | null
          id?: string
          tipo: string
        }
        Update: {
          arquivo_url?: string | null
          colaborador_id?: string
          criado_em?: string | null
          data_emissao?: string | null
          data_vencimento?: string | null
          id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_colaborador_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidades: {
        Row: {
          cliente_id: string
          criado_em: string | null
          estagio: string
          id: string
          previsao_fechamento: string | null
          safra: string | null
          valor_estimado: number | null
          vendedor_id: string
        }
        Insert: {
          cliente_id: string
          criado_em?: string | null
          estagio: string
          id?: string
          previsao_fechamento?: string | null
          safra?: string | null
          valor_estimado?: number | null
          vendedor_id: string
        }
        Update: {
          cliente_id?: string
          criado_em?: string | null
          estagio?: string
          id?: string
          previsao_fechamento?: string | null
          safra?: string | null
          valor_estimado?: number | null
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos_colaborador: {
        Row: {
          colaborador_id: string
          criado_em: string | null
          data_referencia: string
          id: string
          referencia_externa: string | null
          tipo: string
          valor: number
        }
        Insert: {
          colaborador_id: string
          criado_em?: string | null
          data_referencia: string
          id?: string
          referencia_externa?: string | null
          tipo: string
          valor: number
        }
        Update: {
          colaborador_id?: string
          criado_em?: string | null
          data_referencia?: string
          id?: string
          referencia_externa?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_colaborador_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      visitas: {
        Row: {
          anotacoes: string | null
          cliente_id: string
          criado_em: string | null
          data_visita: string
          id: string
          produto_recomendado: string | null
          proximo_followup: string | null
          tipo: string | null
          vendedor_id: string
        }
        Insert: {
          anotacoes?: string | null
          cliente_id: string
          criado_em?: string | null
          data_visita: string
          id?: string
          produto_recomendado?: string | null
          proximo_followup?: string | null
          tipo?: string | null
          vendedor_id: string
        }
        Update: {
          anotacoes?: string | null
          cliente_id?: string
          criado_em?: string | null
          data_visita?: string
          id?: string
          produto_recomendado?: string | null
          proximo_followup?: string | null
          tipo?: string | null
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_cargo: { Args: never; Returns: string }
      auth_colaborador_id: { Args: never; Returns: string }
      auth_equipe_ids: { Args: never; Returns: string[] }
      auth_is_admin: { Args: never; Returns: boolean }
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
type DefaultSchema = DatabaseWithoutInternals["public"]

export type Tables<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Update"]

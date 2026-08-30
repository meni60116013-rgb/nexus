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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      actualizaciones: {
        Row: {
          canal: string
          created_at: string
          fecha_publicacion: string | null
          id: string
          notas: string | null
          obligatoria: boolean
          publicada: boolean
          taller_id: string | null
          titulo: string
          updated_at: string
          version: string
        }
        Insert: {
          canal?: string
          created_at?: string
          fecha_publicacion?: string | null
          id?: string
          notas?: string | null
          obligatoria?: boolean
          publicada?: boolean
          taller_id?: string | null
          titulo?: string
          updated_at?: string
          version: string
        }
        Update: {
          canal?: string
          created_at?: string
          fecha_publicacion?: string | null
          id?: string
          notas?: string | null
          obligatoria?: boolean
          publicada?: boolean
          taller_id?: string | null
          titulo?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "actualizaciones_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      actualizaciones_admin: {
        Row: {
          contenido: string | null
          created_at: string
          etiqueta: string
          id: string
          publicado_en: string
          titulo: string
        }
        Insert: {
          contenido?: string | null
          created_at?: string
          etiqueta?: string
          id?: string
          publicado_en?: string
          titulo: string
        }
        Update: {
          contenido?: string | null
          created_at?: string
          etiqueta?: string
          id?: string
          publicado_en?: string
          titulo?: string
        }
        Relationships: []
      }
      admin_auditoria: {
        Row: {
          accion: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          detalle: string | null
          entidad: string | null
          entidad_id: string | null
          id: string
        }
        Insert: {
          accion: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          detalle?: string | null
          entidad?: string | null
          entidad_id?: string | null
          id?: string
        }
        Update: {
          accion?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          detalle?: string | null
          entidad?: string | null
          entidad_id?: string | null
          id?: string
        }
        Relationships: []
      }
      admin_biometria: {
        Row: {
          activo: boolean
          created_at: string
          credential_id: string | null
          etiqueta: string
          id: string
          owner_id: string
          tipo: string
          ultimo_uso: string | null
        }
        Insert: {
          activo?: boolean
          created_at?: string
          credential_id?: string | null
          etiqueta?: string
          id?: string
          owner_id: string
          tipo?: string
          ultimo_uso?: string | null
        }
        Update: {
          activo?: boolean
          created_at?: string
          credential_id?: string | null
          etiqueta?: string
          id?: string
          owner_id?: string
          tipo?: string
          ultimo_uso?: string | null
        }
        Relationships: []
      }
      admin_master_token: {
        Row: {
          activo: boolean
          created_at: string
          etiqueta: string
          id: string
          owner_id: string
          prefijo: string
          token_hash: string
          ultimo_uso: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          etiqueta?: string
          id?: string
          owner_id: string
          prefijo: string
          token_hash: string
          ultimo_uso?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          etiqueta?: string
          id?: string
          owner_id?: string
          prefijo?: string
          token_hash?: string
          ultimo_uso?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nombre: string
          taller_id: string
          telefono: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nombre: string
          taller_id: string
          telefono?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nombre?: string
          taller_id?: string
          telefono?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mantenimiento: {
        Row: {
          activo: boolean
          created_at: string
          fin: string | null
          id: string
          inicio: string
          mensaje: string
          taller_id: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          fin?: string | null
          id?: string
          inicio?: string
          mensaje?: string
          taller_id?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          fin?: string | null
          id?: string
          inicio?: string
          mensaje?: string
          taller_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mantenimiento_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orden_piezas: {
        Row: {
          cantidad: number
          created_at: string
          id: string
          orden_id: string
          pieza_id: string
          precio_unitario: number
        }
        Insert: {
          cantidad?: number
          created_at?: string
          id?: string
          orden_id: string
          pieza_id: string
          precio_unitario?: number
        }
        Update: {
          cantidad?: number
          created_at?: string
          id?: string
          orden_id?: string
          pieza_id?: string
          precio_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "orden_piezas_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes_trabajo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orden_piezas_pieza_id_fkey"
            columns: ["pieza_id"]
            isOneToOne: false
            referencedRelation: "piezas"
            referencedColumns: ["id"]
          },
        ]
      }
      ordenes_trabajo: {
        Row: {
          cliente_id: string | null
          costo_piezas: number
          created_at: string
          descripcion: string | null
          estado: string
          folio: string
          horas_mano_obra: number
          id: string
          synced: boolean
          taller_id: string
          tarifa_hora: number
          tecnico: string | null
          titulo: string
          updated_at: string
          vehiculo_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          costo_piezas?: number
          created_at?: string
          descripcion?: string | null
          estado?: string
          folio: string
          horas_mano_obra?: number
          id?: string
          synced?: boolean
          taller_id: string
          tarifa_hora?: number
          tecnico?: string | null
          titulo: string
          updated_at?: string
          vehiculo_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          costo_piezas?: number
          created_at?: string
          descripcion?: string | null
          estado?: string
          folio?: string
          horas_mano_obra?: number
          id?: string
          synced?: boolean
          taller_id?: string
          tarifa_hora?: number
          tecnico?: string | null
          titulo?: string
          updated_at?: string
          vehiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_trabajo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_trabajo_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_trabajo_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_admin: {
        Row: {
          created_at: string
          estado: string
          fecha: string
          folio: string
          id: string
          metodo: string
          moneda: string
          monto: number
          notas: string | null
          taller_id: string | null
        }
        Insert: {
          created_at?: string
          estado?: string
          fecha?: string
          folio?: string
          id?: string
          metodo?: string
          moneda?: string
          monto?: number
          notas?: string | null
          taller_id?: string | null
        }
        Update: {
          created_at?: string
          estado?: string
          fecha?: string
          folio?: string
          id?: string
          metodo?: string
          moneda?: string
          monto?: number
          notas?: string | null
          taller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_admin_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      piezas: {
        Row: {
          categoria: string
          costo: number
          created_at: string
          id: string
          nombre: string
          precio: number
          sku: string
          stock: number
          stock_minimo: number
          taller_id: string
          updated_at: string
        }
        Insert: {
          categoria?: string
          costo?: number
          created_at?: string
          id?: string
          nombre: string
          precio?: number
          sku: string
          stock?: number
          stock_minimo?: number
          taller_id: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          costo?: number
          created_at?: string
          id?: string
          nombre?: string
          precio?: number
          sku?: string
          stock?: number
          stock_minimo?: number
          taller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "piezas_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      planes: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          moneda: string
          nombre: string
          periodo: string
          precio: number
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          moneda?: string
          nombre: string
          periodo?: string
          precio?: number
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          moneda?: string
          nombre?: string
          periodo?: string
          precio?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_admin: boolean
          nombre_taller: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_admin?: boolean
          nombre_taller?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean
          nombre_taller?: string
          updated_at?: string
        }
        Relationships: []
      }
      suscripciones_taller: {
        Row: {
          created_at: string
          estado: string
          id: string
          inicio: string
          plan_id: string | null
          proximo_cobro: string
          taller_id: string
        }
        Insert: {
          created_at?: string
          estado?: string
          id?: string
          inicio?: string
          plan_id?: string | null
          proximo_cobro?: string
          taller_id: string
        }
        Update: {
          created_at?: string
          estado?: string
          id?: string
          inicio?: string
          plan_id?: string | null
          proximo_cobro?: string
          taller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_taller_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_taller_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens_cliente: {
        Row: {
          created_at: string
          estado: string
          etiqueta: string
          expira_en: string | null
          id: string
          max_dispositivos: number
          plan_id: string | null
          prefijo: string
          taller_id: string | null
          tipo: string
          token_hash: string
          ultimo_uso: string | null
          updated_at: string
          usos: number
        }
        Insert: {
          created_at?: string
          estado?: string
          etiqueta?: string
          expira_en?: string | null
          id?: string
          max_dispositivos?: number
          plan_id?: string | null
          prefijo: string
          taller_id?: string | null
          tipo?: string
          token_hash: string
          ultimo_uso?: string | null
          updated_at?: string
          usos?: number
        }
        Update: {
          created_at?: string
          estado?: string
          etiqueta?: string
          expira_en?: string | null
          id?: string
          max_dispositivos?: number
          plan_id?: string | null
          prefijo?: string
          taller_id?: string | null
          tipo?: string
          token_hash?: string
          ultimo_uso?: string | null
          updated_at?: string
          usos?: number
        }
        Relationships: [
          {
            foreignKeyName: "tokens_cliente_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_cliente_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehiculos: {
        Row: {
          anio: number
          cliente_id: string | null
          created_at: string
          id: string
          km_actual: number
          marca: string
          modelo: string
          placa: string | null
          serie: string | null
          taller_id: string
          tipo: string
          updated_at: string
        }
        Insert: {
          anio?: number
          cliente_id?: string | null
          created_at?: string
          id?: string
          km_actual?: number
          marca: string
          modelo: string
          placa?: string | null
          serie?: string | null
          taller_id: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          anio?: number
          cliente_id?: string | null
          created_at?: string
          id?: string
          km_actual?: number
          marca?: string
          modelo?: string
          placa?: string | null
          serie?: string | null
          taller_id?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehiculos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehiculos_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "soporte" | "taller"
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
      app_role: ["admin", "soporte", "taller"],
    },
  },
} as const

// Tipos que representan las tablas de Supabase
// Actualizar si se agregan columnas nuevas a la BD

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          email: string;
          nombre: string | null;
          avatar_url: string | null;
          google_id: string | null;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          email: string;
          nombre?: string | null;
          avatar_url?: string | null;
          google_id?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          nombre?: string | null;
          avatar_url?: string | null;
          actualizado_en?: string;
        };
      };
      portafolios: {
        Row: {
          id: string;
          usuario_id: string;
          nombre: string;
          descripcion: string | null;
          creado_en: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          nombre: string;
          descripcion?: string | null;
          creado_en?: string;
        };
        Update: {
          nombre?: string;
          descripcion?: string | null;
        };
      };
      activos: {
        Row: {
          id: string;
          portafolio_id: string;
          simbolo: string;
          nombre: string;
          cantidad: number;
          precio_compra: number;
          creado_en: string;
        };
        Insert: {
          id?: string;
          portafolio_id: string;
          simbolo: string;
          nombre: string;
          cantidad: number;
          precio_compra: number;
          creado_en?: string;
        };
        Update: {
          cantidad?: number;
          precio_compra?: number;
        };
      };
    };
  };
}

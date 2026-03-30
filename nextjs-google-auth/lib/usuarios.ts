import { supabaseAdmin } from "@/lib/supabase-admin";

// Busca un usuario por email en Supabase
export async function obtenerUsuarioPorEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no encontrado, no es un error real
    throw new Error(`Error al buscar usuario: ${error.message}`);
  }

  return data ?? null;
}

// Crea un usuario nuevo en Supabase
export async function crearUsuario(datos: {
  email: string;
  nombre: string | null;
  avatar_url: string | null;
  google_id: string | null;
}) {
  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .insert({
      email: datos.email,
      nombre: datos.nombre,
      avatar_url: datos.avatar_url,
      google_id: datos.google_id,
      actualizado_en: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear usuario: ${error.message}`);
  }

  return data;
}

// Actualiza datos del usuario (nombre, avatar)
export async function actualizarUsuario(
  email: string,
  datos: { nombre?: string; avatar_url?: string }
) {
  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .update({ ...datos, actualizado_en: new Date().toISOString() })
    .eq("email", email)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar usuario: ${error.message}`);
  }

  return data;
}

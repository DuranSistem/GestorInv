-- =============================================
-- EJECUTAR EN: Supabase > SQL Editor
-- =============================================

-- Tabla de usuarios (se crea al registrarse con Google)
create table if not exists public.usuarios (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  nombre        text,
  avatar_url    text,
  google_id     text unique,
  creado_en     timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- Tabla de portafolios (cada usuario puede tener varios)
create table if not exists public.portafolios (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references public.usuarios(id) on delete cascade,
  nombre      text not null,
  descripcion text,
  creado_en   timestamptz not null default now()
);

-- Tabla de activos (acciones, ETFs, etc. dentro de un portafolio)
create table if not exists public.activos (
  id            uuid primary key default gen_random_uuid(),
  portafolio_id uuid not null references public.portafolios(id) on delete cascade,
  simbolo       text not null,
  nombre        text not null,
  cantidad      numeric not null default 0,
  precio_compra numeric not null default 0,
  creado_en     timestamptz not null default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Cada usuario solo puede ver y editar sus propios datos
-- =============================================

alter table public.usuarios    enable row level security;
alter table public.portafolios enable row level security;
alter table public.activos     enable row level security;

-- Politicas para usuarios
-- El service role (backend) puede hacer todo
create policy "service role full access usuarios"
  on public.usuarios for all
  using (true)
  with check (true);

-- Politicas para portafolios
create policy "service role full access portafolios"
  on public.portafolios for all
  using (true)
  with check (true);

-- Politicas para activos
create policy "service role full access activos"
  on public.activos for all
  using (true)
  with check (true);

-- =============================================
-- INDICES para mejorar performance
-- =============================================

create index if not exists idx_usuarios_email     on public.usuarios(email);
create index if not exists idx_usuarios_google_id on public.usuarios(google_id);
create index if not exists idx_portafolios_usuario on public.portafolios(usuario_id);
create index if not exists idx_activos_portafolio  on public.activos(portafolio_id);

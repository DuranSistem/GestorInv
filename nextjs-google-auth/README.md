# Gestor de Inversiones — Autenticación con Google

Aplicación Next.js 14 con inicio de sesión mediante Google OAuth, construida con NextAuth.js.

## Requisitos

- Node.js 18 o superior
- Cuenta de Google para crear credenciales OAuth

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar el archivo de variables de entorno
copy .env.local.example .env.local
```

## Configuración de Google OAuth

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear un proyecto nuevo
3. Ir a **APIs y servicios > Pantalla de consentimiento de OAuth**
   - Tipo de usuario: Externo
   - Completar nombre de la app y email
4. Ir a **APIs y servicios > Credenciales > Crear credenciales > ID de cliente OAuth 2.0**
   - Tipo: Aplicación web
   - URI de redireccionamiento autorizado:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
5. Copiar el **Client ID** y **Client Secret**

## Variables de entorno

Editar el archivo `.env.local` con las credenciales obtenidas:

```env
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
NEXTAUTH_SECRET=cadena_aleatoria_segura
NEXTAUTH_URL=http://localhost:3000
```

Para generar el `NEXTAUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Estructura del proyecto

```
app/
├── api/auth/[...nextauth]/route.ts  # Endpoint OAuth
├── login/page.tsx                   # Página de login
├── dashboard/page.tsx               # Página privada (requiere sesión)
├── register-google/page.tsx         # Registro para usuarios nuevos
├── layout.tsx                       # Layout raíz
└── providers.tsx                    # SessionProvider

components/
└── GoogleSignInButton.tsx           # Botón de login con Google

lib/
└── auth.ts                          # Configuración de NextAuth

middleware.ts                        # Protección de rutas privadas
```

## Escenarios cubiertos

| Escenario | Descripción | Comportamiento |
|-----------|-------------|----------------|
| Sc.1 | Visualización del botón | Botón visible y habilitado en `/login` |
| Sc.2 | Clic en el botón | Redirige al flujo OAuth de Google |
| Sc.3 | Login exitoso | Redirige a `/dashboard` con sesión activa |
| Sc.4 | Usuario sin cuenta | Redirige a `/register-google` |
| Sc.5 | Error o cancelación | Muestra mensaje, permanece en `/login` |
| Sc.6 | Permisos solicitados | Solo `email` y `profile` básico |

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Verificar errores de código
```

## Tecnologías

- [Next.js 14](https://nextjs.org/) — Framework React con App Router
- [NextAuth.js](https://next-auth.js.org/) — Autenticación
- [TypeScript](https://www.typescriptlang.org/) — Tipado estático

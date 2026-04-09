import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { obtenerUsuarioPorEmail, crearUsuario, actualizarUsuario } from "@/lib/usuarios";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Sc.6: solo email y perfil basico
          scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",             // Sc.5: error redirige a login
    newUser: "/register-google", // Sc.4: usuario nuevo
  },

  callbacks: {
    // Se ejecuta ANTES de crear la sesion
    // Verifica si el usuario existe en Supabase
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return false;

      try {
        const usuarioExistente = await obtenerUsuarioPorEmail(user.email!);

        if (usuarioExistente) {
          // Sc.3: usuario existe → actualizar foto/nombre por si cambiaron en Google
          await actualizarUsuario(user.email!, {
            nombre: user.name ?? undefined,
            avatar_url: user.image ?? undefined,
          });
          return true; // Permite el login, redirige al dashboard
        }

        // Sc.4: usuario nuevo → pasar datos via cookie HTTP-only (no URL params) y redirigir a registro
        return `/api/auth/register-pending?email=${encodeURIComponent(user.email!)}&nombre=${encodeURIComponent(user.name ?? "")}&avatar=${encodeURIComponent(user.image ?? "")}&googleId=${encodeURIComponent(profile?.sub ?? "")}`;

      } catch (error) {
        console.error("Error en signIn callback:", error);
        return false; // Sc.5: error → redirige a /login con ?error=
      }
    },

    // Agrega el ID de Supabase al token JWT
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.googleId = profile?.sub;
      }

      // Cargar supabaseId si no esta en el token aun
      if (token.email && !token.supabaseId) {
        try {
          const usuario = await obtenerUsuarioPorEmail(token.email as string);
          if (usuario) token.supabaseId = usuario.id;
        } catch {
          // No bloquear si falla
        }
      }

      return token;
    },

    // Expone supabaseId en la sesion del cliente
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.supabaseId as string) ?? token.sub ?? "";
      }
      return session;
    },

    // Sc.3: tras login exitoso redirige al dashboard
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  secret: process.env.NEXTAUTH_SECRET,
};

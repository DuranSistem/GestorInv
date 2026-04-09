import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RegisterGoogleContent from "./RegisterGoogleContent";

// Server Component: lee la cookie HTTP-only con los datos del nuevo usuario
// y los pasa como props al componente cliente. La cookie se elimina al leerla
// para que no pueda reutilizarse.
export default async function RegisterGooglePage() {
  const cookieStore = cookies();
  const raw = cookieStore.get("pending_registration")?.value;

  if (!raw) {
    redirect("/login");
  }

  let data: { email: string; nombre: string; avatar: string; googleId: string };
  try {
    data = JSON.parse(raw);
  } catch {
    redirect("/login");
  }

  if (!data.email) {
    redirect("/login");
  }

  return (
    <RegisterGoogleContent
      email={data.email}
      nombre={data.nombre}
      avatar={data.avatar}
      googleId={data.googleId}
    />
  );
}

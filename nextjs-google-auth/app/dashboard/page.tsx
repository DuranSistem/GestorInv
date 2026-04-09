import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import OKOMOSDashboard from "./OKOMOSDashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main style={{ minHeight: "100vh" }}>
      <OKOMOSDashboard user={session.user ?? {}} />
    </main>
  );
}

"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        background: "transparent",
        border: "1px solid #E2E8F0",
        borderRadius: "8px",
        padding: "0.375rem 0.875rem",
        fontSize: "0.8125rem",
        fontWeight: 500,
        color: "#64748B",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      Cerrar sesión
    </button>
  );
}

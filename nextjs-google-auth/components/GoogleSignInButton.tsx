"use client";

interface Props {
  onClick: () => void;
  isLoading: boolean;
}

// Sc.1: boton visible y habilitado con texto "Iniciar sesion con Google"
export default function GoogleSignInButton({ onClick, isLoading }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      aria-label="Iniciar sesion con Google"
      data-testid="google-signin-button"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        width: "100%",
        padding: "11px 16px",
        background: isLoading ? "#F8FAFC" : "#ffffff",
        border: "1px solid #E2E8F0",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: 500,
        color: isLoading ? "#94A3B8" : "#1E293B",
        cursor: isLoading ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        transition: "border-color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#CBD5E1";
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0";
        }
      }}
    >
      {isLoading ? <Spinner /> : <GoogleIcon />}
      <span>{isLoading ? "Redirigiendo a Google..." : "Iniciar sesion con Google"}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="9" cy="9" r="7" stroke="#CBD5E1" strokeWidth="2" fill="none"/>
      <path d="M9 2a7 7 0 017 7" stroke="#64748B" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

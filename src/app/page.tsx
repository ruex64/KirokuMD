"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { FileText, Sun, Moon } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <header className="p-4 flex justify-end">
        <button
          onClick={toggleTheme}
          className="p-2 transition-opacity hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-12">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <FileText 
              className="w-12 h-12"
              style={{ color: "var(--text-ghost)" }}
            />
          </div>

          <h1 
            className="text-3xl font-medium mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            KirokuMD
          </h1>

          <p 
            className="mb-8"
            style={{ color: "var(--text-muted)" }}
          >
            A quiet space for documentation. Write, preview, and export markdown with minimal friction.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="px-6 py-2.5 text-sm font-medium border transition-opacity hover:opacity-80"
              style={{ 
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)"
              }}
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ 
                background: "var(--accent)",
                color: "var(--bg-primary)"
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="p-4 text-center text-xs"
        style={{ color: "var(--text-ghost)" }}
      >
        Minimal. Focused. Yours.
      </footer>
    </div>
  );
}

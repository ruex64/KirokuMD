"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Clock, LogOut, Sun, Moon } from "lucide-react";

export default function PendingApprovalPage() {
  const { user, appUser, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (appUser?.status === "approved") {
        router.push("/dashboard");
      } else if (appUser?.status === "rejected") {
        router.push("/access-denied");
      }
    }
  }, [user, appUser, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading || !user || appUser?.status !== "pending") {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <span 
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          {appUser?.email}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-12">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "var(--bg-secondary)" }}
            >
              <Clock 
                className="w-8 h-8"
                style={{ color: "var(--accent)" }}
              />
            </div>
          </div>

          <h1 
            className="text-2xl font-medium mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Awaiting Approval
          </h1>

          <p 
            className="mb-6"
            style={{ color: "var(--text-muted)" }}
          >
            Your account has been created successfully. An administrator needs to approve your access before you can use KirokuMD.
          </p>

          <p 
            className="text-sm"
            style={{ color: "var(--text-ghost)" }}
          >
            You will be notified once your account has been reviewed. Please check back later.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="p-4 text-center text-xs"
        style={{ color: "var(--text-ghost)" }}
      >
        Questions? Contact your administrator.
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-2xl font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            KirokuMD
          </h1>
          <p 
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Sign in to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="flex items-center gap-2 p-3 mb-4 text-sm border"
            style={{ 
              background: "var(--bg-secondary)",
              borderColor: "var(--accent)",
              color: "var(--accent)"
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              className="block text-xs mb-1.5 uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Email
            </label>
            <div className="relative">
              <Mail 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-ghost)" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 text-sm border outline-none transition-colors"
                style={{ 
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)"
                }}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label 
              className="block text-xs mb-1.5 uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Password
            </label>
            <div className="relative">
              <Lock 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-ghost)" }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 text-sm border outline-none transition-colors"
                style={{ 
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)"
                }}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ 
              background: "var(--accent)",
              color: "var(--bg-primary)"
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />
          <span className="text-xs" style={{ color: "var(--text-ghost)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 text-sm font-medium border transition-opacity disabled:opacity-50"
          style={{ 
            background: "transparent",
            borderColor: "var(--border-primary)",
            color: "var(--text-primary)"
          }}
        >
          Continue with Google
        </button>

        {/* Sign Up Link */}
        <p 
          className="text-center text-sm mt-6"
          style={{ color: "var(--text-muted)" }}
        >
          Do not have an account?{" "}
          <Link 
            href="/signup" 
            className="transition-opacity hover:opacity-70"
            style={{ color: "var(--accent)" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

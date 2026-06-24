"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Camera } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (res.error) {
      setLoading(false);
      let errorMsg = res.error.message || "Ocorreu um erro ao fazer login.";
      
      // Traduz os erros mais comuns
      if (errorMsg.includes("Invalid email or password") || errorMsg.includes("Invalid password")) {
        errorMsg = "E-mail ou senha incorretos.";
      } else if (errorMsg.includes("User not found")) {
        errorMsg = "Usuário não encontrado.";
      }
      
      setError(errorMsg);
    } else {
      // Deixa o loading=true enquanto puxa os dados e redirecioniona
      const { organization } = await import("@/lib/auth-client");
      const orgs = await organization.list();
      
      if (orgs.data && orgs.data.length > 0) {
        await organization.setActive({ organizationId: orgs.data[0].id });
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-pw-accent flex items-center justify-center">
            <Camera size={22} className="text-pw-bg" />
          </div>
          <span className="text-xl font-bold text-pw-text tracking-tight">
            Photo Work
          </span>
        </div>

        <div className="card">
          <h1 className="text-lg font-bold text-pw-text mb-1">Fazer Login</h1>
          <p className="text-sm text-pw-text-muted mb-6">
            Entre com suas credenciais para acessar o sistema.
          </p>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-md text-sm bg-pw-danger/15 text-pw-danger border border-pw-danger/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-sm text-pw-text-muted text-center mt-6">
            Ainda não tem conta?{" "}
            <Link
              href="/sign-up"
              className="text-pw-accent hover:underline font-medium"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

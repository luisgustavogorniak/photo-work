"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Camera } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    const res = await signUp.email({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password,
    });

    setLoading(false);

    if (res.error) {
      setError(res.error.message || "Ocorreu um erro ao criar a conta.");
    } else {
      router.push("/onboarding");
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
          <h1 className="text-lg font-bold text-pw-text mb-1">Criar Conta</h1>
          <p className="text-sm text-pw-text-muted mb-6">
            Cadastre-se para começar a usar o sistema.
          </p>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-md text-sm bg-pw-danger/15 text-pw-danger border border-pw-danger/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="form-label">
                Nome completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Seu nome"
                required
                className="input-field"
              />
            </div>
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
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
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
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>

          <p className="text-sm text-pw-text-muted text-center mt-6">
            Já tem uma conta?{" "}
            <Link
              href="/sign-in"
              className="text-pw-accent hover:underline font-medium"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { organization } from "@/lib/auth-client";
import { seedStudioEnvironment } from "@/app/actions/setup.actions";
import { Camera, ArrowRight, Store } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [studioName, setStudioName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cria a Organização (Tenant) via Better Auth e
   * popula os dados iniciais (Fluxos de Produção) via Server Action.
   */
  async function handleCreateStudio(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!studioName.trim()) {
      setError("Informe o nome do seu estúdio.");
      return;
    }

    setLoading(true);

    try {
      // 1. Criar a Organização via Better Auth
      const slug = studioName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const res = await organization.create({
        name: studioName,
        slug,
      });

      if (res.error) {
        throw new Error(res.error.message || "Erro ao criar organização.");
      }

      // 2. Setar a organização como ativa na sessão
      await organization.setActive({
        organizationId: res.data!.id,
      });

      // 3. Popular dados iniciais (Fluxos de Produção)
      const seedResult = await seedStudioEnvironment(res.data!.id);

      if (!seedResult.success) {
        console.error("Seed error:", seedResult.error);
        // Não bloqueia o fluxo, os fluxos podem ser criados depois
      }

      // 4. Redirecionar para o Dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-lg bg-pw-accent flex items-center justify-center">
            <Camera size={22} className="text-pw-bg" />
          </div>
          <span className="text-xl font-bold text-pw-text tracking-tight">
            Photo Work
          </span>
        </div>

        <div className="card">
          {/* Ícone do contexto */}
          <div className="w-12 h-12 rounded-xl bg-pw-accent/10 flex items-center justify-center mb-5">
            <Store size={24} className="text-pw-accent" />
          </div>

          <h1 className="text-xl font-bold text-pw-text mb-1">
            Vamos configurar seu estúdio
          </h1>
          <p className="text-sm text-pw-text-muted mb-6">
            Dê um nome ao seu estúdio para começar. Você poderá alterar isso
            depois nas configurações.
          </p>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-md text-sm bg-pw-danger/15 text-pw-danger border border-pw-danger/30">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateStudio} className="space-y-5">
            <div>
              <label htmlFor="studioName" className="form-label">
                Nome do Estúdio
              </label>
              <input
                id="studioName"
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="Ex: Estúdio Central"
                required
                className="input-field"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-pw-bg border-t-transparent rounded-full animate-spin" />
                  Criando estúdio...
                </>
              ) : (
                <>
                  Criar Estúdio
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-xs text-pw-text-muted text-center mt-6">
          Ao criar o estúdio, os fluxos de produção padrão serão
          configurados automaticamente para você.
        </p>
      </div>
    </main>
  );
}

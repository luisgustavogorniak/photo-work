"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer } from "@/app/actions/customer.actions";
import { ArrowLeft, Save, User, Building2 } from "lucide-react";

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipo, setTipo] = useState<"PF" | "PJ">("PF");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await createCustomer({
      type: tipo,
      name: formData.get("name") as string,
      document: formData.get("document") as string,
      phone: formData.get("phone") as string,
      whatsapp: formData.get("whatsapp") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      birthDate: formData.get("birthDate") as string,
      notes: formData.get("notes") as string,
      preferences: formData.get("preferences") as string,
    });

    setLoading(false);

    if (result.success) {
      router.push("/dashboard/clientes");
    } else {
      setError(result.error || "Ocorreu um erro ao cadastrar o cliente.");
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/dashboard/clientes")}
          className="p-2 rounded-md text-pw-text-muted hover:text-pw-text hover:bg-pw-surface transition-all duration-150"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-pw-text">Novo Cliente</h1>
          <p className="text-sm text-pw-text-muted mt-0.5">
            Preencha os dados para cadastrar um novo cliente.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-md text-sm bg-pw-danger/15 text-pw-danger border border-pw-danger/30">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Pessoa */}
        <div className="card">
          <h2 className="text-sm font-semibold text-pw-text mb-4">
            Tipo de Pessoa
          </h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTipo("PF")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer border ${
                tipo === "PF"
                  ? "border-pw-accent bg-pw-accent/10 text-pw-accent"
                  : "border-pw-border text-pw-text-muted hover:border-pw-text-muted"
              }`}
            >
              <User size={18} />
              Pessoa Física
            </button>
            <button
              type="button"
              onClick={() => setTipo("PJ")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer border ${
                tipo === "PJ"
                  ? "border-pw-accent bg-pw-accent/10 text-pw-accent"
                  : "border-pw-border text-pw-text-muted hover:border-pw-text-muted"
              }`}
            >
              <Building2 size={18} />
              Pessoa Jurídica
            </button>
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="card">
          <h2 className="text-sm font-semibold text-pw-text mb-4">
            {tipo === "PF" ? "Dados Pessoais" : "Dados da Empresa"}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="form-label">
                {tipo === "PF" ? "Nome completo" : "Razão Social"} *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder={
                  tipo === "PF"
                    ? "Ex: Maria da Silva"
                    : "Ex: Estúdio Central Ltda."
                }
                required
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="document" className="form-label">
                  {tipo === "PF" ? "CPF" : "CNPJ"}
                </label>
                <input
                  id="document"
                  name="document"
                  type="text"
                  placeholder={
                    tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00"
                  }
                  className="input-field"
                />
              </div>
              {tipo === "PF" && (
                <div>
                  <label htmlFor="birthDate" className="form-label">
                    Data de Nascimento
                  </label>
                  <input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    className="input-field"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="card">
          <h2 className="text-sm font-semibold text-pw-text mb-4">Contato</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="form-label">
                  Telefone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(00) 0000-0000"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="whatsapp" className="form-label">
                  WhatsApp
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="form-label">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="cliente@email.com"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="card">
          <h2 className="text-sm font-semibold text-pw-text mb-4">Endereço</h2>
          <div>
            <label htmlFor="address" className="form-label">
              Endereço completo
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Rua, número, bairro, cidade - UF"
              className="input-field"
            />
          </div>
        </div>

        {/* Observações e Preferências */}
        <div className="card">
          <h2 className="text-sm font-semibold text-pw-text mb-4">
            Observações e Preferências
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="notes" className="form-label">
                Observações internas
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Anotações internas sobre o cliente..."
                className="input-field resize-none"
              />
            </div>
            <div>
              <label htmlFor="preferences" className="form-label">
                Preferências do cliente
              </label>
              <textarea
                id="preferences"
                name="preferences"
                rows={2}
                placeholder="Ex: Prefere acabamento fosco, moldura preta, recebe promoções por WhatsApp..."
                className="input-field resize-none"
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-pw-bg border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />
                Cadastrar Cliente
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/clientes")}
            className="btn-secondary text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

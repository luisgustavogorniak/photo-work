"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/actions/product.actions";
import { ArrowLeft, Save, Package, Scissors, Frame } from "lucide-react";

export default function NovoProdutoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"FINISHED_GOOD" | "RAW_MATERIAL" | "SERVICE">("FINISHED_GOOD");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await createProduct({
      type,
      name: formData.get("name") as string,
      costPrice: Number(formData.get("costPrice")) || 0,
      sellingPrice: Number(formData.get("sellingPrice")) || 0,
      currentStock: Number(formData.get("currentStock")) || 0,
      minStock: Number(formData.get("minStock")) || 0,
      unitMeasure: formData.get("unitMeasure") as string,
    });

    setLoading(false);

    if (result.success) {
      router.push("/dashboard/estoque");
    } else {
      setError(result.error || "Ocorreu um erro ao cadastrar.");
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/dashboard/estoque")}
          className="p-2 rounded-md text-pw-text-muted hover:text-pw-text hover:bg-pw-surface transition-all duration-150"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-pw-text">Novo Item no Estoque</h1>
          <p className="text-sm text-pw-text-muted mt-0.5">
            Cadastre matérias-primas, produtos finais ou serviços.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-md text-sm bg-pw-danger/15 text-pw-danger border border-pw-danger/30">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-pw-text mb-4">Tipo do Item</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType("FINISHED_GOOD")}
              className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-md text-sm font-medium transition-all cursor-pointer border ${
                type === "FINISHED_GOOD" ? "border-pw-accent bg-pw-accent/10 text-pw-accent" : "border-pw-border text-pw-text-muted hover:border-pw-text-muted"
              }`}
            >
              <Frame size={20} />
              Produto Final
              <span className="text-[10px] opacity-70 font-normal">Ex: Quadro 30x40, Caneca</span>
            </button>
            <button
              type="button"
              onClick={() => setType("RAW_MATERIAL")}
              className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-md text-sm font-medium transition-all cursor-pointer border ${
                type === "RAW_MATERIAL" ? "border-pw-accent bg-pw-accent/10 text-pw-accent" : "border-pw-border text-pw-text-muted hover:border-pw-text-muted"
              }`}
            >
              <Package size={20} />
              Matéria-prima
              <span className="text-[10px] opacity-70 font-normal">Ex: Papel Foto, Moldura, Tinta</span>
            </button>
            <button
              type="button"
              onClick={() => setType("SERVICE")}
              className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-md text-sm font-medium transition-all cursor-pointer border ${
                type === "SERVICE" ? "border-pw-accent bg-pw-accent/10 text-pw-accent" : "border-pw-border text-pw-text-muted hover:border-pw-text-muted"
              }`}
            >
              <Scissors size={20} />
              Serviço
              <span className="text-[10px] opacity-70 font-normal">Ex: Restauração, Edição</span>
            </button>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-pw-text mb-4">Informações Básicas</h2>
          
          <div>
            <label className="form-label">Nome do Item *</label>
            <input name="name" required placeholder="Ex: Papel Fotográfico Fosco A4" className="input-field" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Preço de Custo (R$)</label>
              <input name="costPrice" type="number" step="0.01" min="0" placeholder="0.00" className="input-field" />
            </div>
            <div>
              <label className="form-label">Preço de Venda (R$)</label>
              <input name="sellingPrice" type="number" step="0.01" min="0" placeholder="0.00" className="input-field" />
            </div>
          </div>
        </div>

        {type !== "SERVICE" && (
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-pw-text mb-4">Controle de Estoque</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="form-label">Estoque Inicial</label>
                <input name="currentStock" type="number" step="0.01" min="0" defaultValue={0} className="input-field" />
              </div>
              <div>
                <label className="form-label">Estoque Mínimo</label>
                <input name="minStock" type="number" step="0.01" min="0" defaultValue={0} className="input-field" />
              </div>
              <div>
                <label className="form-label">Unid. de Medida</label>
                <select name="unitMeasure" className="input-field appearance-none cursor-pointer">
                  <option value="UN">Unidade (UN)</option>
                  <option value="M">Metros (M)</option>
                  <option value="M2">Metros Quadrados (M²)</option>
                  <option value="KG">Quilos (KG)</option>
                  <option value="L">Litros (L)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
            {loading ? "Salvando..." : <><Save size={16} /> Cadastrar Item</>}
          </button>
          <button type="button" onClick={() => router.push("/dashboard/estoque")} className="btn-secondary text-sm">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

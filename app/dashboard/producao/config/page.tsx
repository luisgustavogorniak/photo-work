"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listProductionWorkflows, createProductionWorkflow } from "@/app/actions/production.actions";
import { ArrowLeft, Save, Plus, Trash2, Settings, ListTree } from "lucide-react";

export default function WorkflowConfigPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<string[]>(["Impressão", "Acabamento", "Conferência"]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  async function loadWorkflows() {
    setLoading(true);
    const result = await listProductionWorkflows();
    if (result.success) {
      setWorkflows(result.workflows as any[]);
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const validSteps = steps.filter(s => s.trim() !== "");
    if (validSteps.length === 0) return alert("Adicione pelo menos uma etapa.");

    setSaving(true);
    const result = await createProductionWorkflow(name, validSteps);
    setSaving(false);

    if (result.success) {
      setName("");
      setSteps(["Impressão", "Acabamento", "Conferência"]);
      loadWorkflows();
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="max-w-4xl pb-12">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/dashboard/producao")} className="p-2 rounded-md text-pw-text-muted hover:text-pw-text hover:bg-pw-surface transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-pw-text flex items-center gap-2">
            <Settings size={22} className="text-pw-accent" /> Configuração de Produção
          </h1>
          <p className="text-sm text-pw-text-muted mt-0.5">
            Crie os fluxos personalizados do seu laboratório e defina as etapas de produção.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        
        {/* Formulário Criar Novo */}
        <div className="card space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-pw-text flex items-center gap-2">
            <Plus size={16} /> Novo Fluxo
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="form-label">Nome do Fluxo</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Ex: Quadros e Molduras" 
                required 
                className="input-field" 
              />
            </div>

            <div>
              <label className="form-label mb-2 flex items-center justify-between">
                <span>Etapas do Processo (Kanban)</span>
                <button 
                  type="button" 
                  onClick={() => setSteps([...steps, "Nova Etapa"])}
                  className="text-xs text-pw-accent hover:underline flex items-center gap-1"
                >
                  <Plus size={12}/> Adicionar Etapa
                </button>
              </label>
              
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-xs font-mono text-pw-text-muted w-4">{idx + 1}.</span>
                    <input 
                      value={step} 
                      onChange={e => {
                        const newSteps = [...steps];
                        newSteps[idx] = e.target.value;
                        setSteps(newSteps);
                      }}
                      className="input-field text-sm py-1.5"
                    />
                    <button 
                      type="button" 
                      onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                      className="p-1.5 text-pw-danger hover:bg-pw-danger/10 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving || steps.length === 0} className="btn-primary w-full text-sm py-2 mt-2">
              {saving ? "Salvando..." : "Salvar Fluxo"}
            </button>
          </form>
        </div>

        {/* Lista de Existentes */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-pw-text flex items-center gap-2">
            <ListTree size={16} /> Fluxos Existentes
          </h2>
          
          {loading ? (
            <p className="text-sm text-pw-text-muted">Carregando...</p>
          ) : workflows.length === 0 ? (
             <div className="card text-center py-8">
               <p className="text-sm text-pw-text-muted">Nenhum fluxo cadastrado.</p>
             </div>
          ) : (
            <div className="space-y-3">
              {workflows.map(wf => (
                <div key={wf.id} className="card p-4 hover:border-pw-accent transition-colors">
                  <h3 className="text-sm font-bold text-pw-text mb-3">{wf.name}</h3>
                  <div className="flex items-center flex-wrap gap-2">
                    {wf.steps.map((s: any, i: number) => (
                      <div key={s.id} className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-pw-surface border border-pw-border rounded-full text-pw-text-muted">
                          {i+1}. {s.name}
                        </span>
                        {i < wf.steps.length - 1 && <span className="text-pw-border text-xs">&rarr;</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

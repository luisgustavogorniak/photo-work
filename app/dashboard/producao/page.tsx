"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listProductionWorkflows, getKanbanBoard, moveOrderToStep } from "@/app/actions/production.actions";
import { Settings, FolderOpen, Clock, ArrowRight, User } from "lucide-react";

export default function ProducaoKanbanPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWfId, setSelectedWfId] = useState("");
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await listProductionWorkflows();
      if (res.success && res.workflows.length > 0) {
        setWorkflows(res.workflows);
        setSelectedWfId(res.workflows[0].id);
      } else {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedWfId) fetchBoard();
  }, [selectedWfId]);

  async function fetchBoard() {
    setLoading(true);
    const res = await getKanbanBoard(selectedWfId);
    if (res.success) {
      setBoard(res.board);
    }
    setLoading(false);
  }

  async function handleMoveCard(orderId: string, nextStepId: string) {
    setMovingId(orderId);
    const res = await moveOrderToStep(orderId, nextStepId);
    if (res.success) {
      await fetchBoard();
    } else {
      alert(res.error);
    }
    setMovingId(null);
  }

  if (loading && !selectedWfId) {
    return <div className="flex justify-center py-20"><div className="w-5 h-5 border-2 border-pw-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (workflows.length === 0) {
    return (
      <div className="card text-center py-20 max-w-2xl mx-auto mt-10">
        <h2 className="text-lg font-bold text-pw-text mb-2">Nenhum fluxo de produção configurado</h2>
        <p className="text-sm text-pw-text-muted mb-6">Você precisa configurar pelo menos um fluxo (ex: Quadros, Fotolivros) para usar o Kanban.</p>
        <button onClick={() => router.push("/dashboard/producao/config")} className="btn-primary inline-flex items-center gap-2">
          <Settings size={16} /> Configurar Fluxos
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-pw-text">Kanban de Produção</h1>
          <p className="text-sm text-pw-text-muted mt-1">
            Acompanhe e movimente os envelopes pelas etapas.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedWfId} 
            onChange={e => setSelectedWfId(e.target.value)}
            className="input-field py-2 text-sm font-semibold w-64 bg-pw-surface border-pw-accent/30"
          >
            {workflows.map(wf => (
              <option key={wf.id} value={wf.id}>Fluxo: {wf.name}</option>
            ))}
          </select>
          <button
            onClick={() => router.push("/dashboard/producao/config")}
            className="p-2 rounded-md text-pw-text-muted hover:text-pw-text hover:bg-pw-surface"
            title="Configurar Fluxos"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center"><div className="w-5 h-5 border-2 border-pw-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 items-start">
            {board.map((step, stepIndex) => {
              const nextStep = board[stepIndex + 1];
              
              return (
                <div key={step.id} className="w-full bg-pw-surface/50 border border-pw-border rounded-lg flex flex-col max-h-[70vh]">
                  
                  {/* Column Header */}
                  <div className="p-3 border-b border-pw-border flex justify-between items-center bg-pw-surface rounded-t-lg">
                    <h3 className="text-sm font-bold text-pw-text truncate pr-2">{step.name}</h3>
                    <span className="text-xs font-semibold bg-pw-bg px-2 py-0.5 rounded text-pw-text-muted">
                      {step.orders.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {step.orders.length === 0 ? (
                      <div className="text-center py-6 text-[10px] text-pw-text-muted border border-dashed border-pw-border rounded-md">
                        Nenhum pedido nesta etapa
                      </div>
                    ) : (
                      step.orders.map((o: any) => {
                        const isLate = o.expectedDate && new Date(o.expectedDate) < new Date();
                        
                        return (
                          <div 
                            key={o.orderId} 
                            className={`bg-pw-bg border rounded-md p-3 shadow-sm hover:border-pw-accent/50 transition-colors ${movingId === o.orderId ? 'opacity-50' : ''} ${isLate ? 'border-pw-danger/40' : 'border-pw-border'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-mono bg-pw-surface border border-pw-border px-1.5 py-0.5 rounded flex items-center gap-1 text-pw-text-muted">
                                <FolderOpen size={10} /> {o.envelopeNumber || `#${o.orderNumber}`}
                              </span>
                              {o.expectedDate && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${isLate ? 'bg-pw-danger/10 text-pw-danger' : 'text-pw-text-muted bg-pw-surface'}`}>
                                  <Clock size={10} /> {new Date(o.expectedDate).toLocaleDateString("pt-BR", {day:'2-digit', month:'2-digit'})}
                                </span>
                              )}
                            </div>
                            
                            <h4 className="text-sm font-semibold text-pw-text truncate cursor-pointer hover:underline" onClick={() => router.push(`/dashboard/pedidos/${o.orderId}`)}>
                              {o.customerName}
                            </h4>

                            <div className="mt-3 flex justify-between items-end border-t border-pw-border/50 pt-2">
                              <span className="text-[10px] text-pw-text-muted flex items-center gap-1 truncate max-w-[120px]">
                                <User size={10} /> {o.assignedTo}
                              </span>
                              
                              {nextStep && (
                                <button 
                                  onClick={() => handleMoveCard(o.orderId, nextStep.id)}
                                  disabled={movingId === o.orderId}
                                  className="text-[10px] bg-pw-accent/10 hover:bg-pw-accent/20 text-pw-accent font-bold px-2 py-1 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                                >
                                  Avançar <ArrowRight size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}

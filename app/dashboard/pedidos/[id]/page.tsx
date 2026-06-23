"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getOrderById, updateOrderStatus } from "@/app/actions/order.actions";
import { listProductionWorkflows, startOrderProduction } from "@/app/actions/production.actions";
import { ArrowLeft, User, Package, FolderOpen, CreditCard, Check, Clock, AlertTriangle, ArrowRight } from "lucide-react";

const statusColors: Record<string, string> = {
  BUDGET: "bg-pw-surface text-pw-text-muted border-pw-border",
  APPROVED: "bg-pw-accent/20 text-pw-accent border-pw-accent/30",
  IN_PRODUCTION: "bg-pw-warning/20 text-pw-warning border-pw-warning/30",
  READY: "bg-pw-success/20 text-pw-success border-pw-success/30",
  DELIVERED: "bg-pw-surface border-pw-border text-pw-text",
  CANCELED: "bg-pw-danger/20 text-pw-danger border-pw-danger/30"
};

const statusLabels: Record<string, string> = {
  BUDGET: "Orçamento",
  APPROVED: "Aprovado (Fila)",
  IN_PRODUCTION: "Em Produção",
  READY: "Pronto p/ Retirada",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado"
};

export default function PedidoDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workflow Selection
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWfId, setSelectedWfId] = useState("");
  const [showWfSelect, setShowWfSelect] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    const result = await getOrderById(orderId);
    if (result.success) {
      setOrder(result.order);
    } else {
      setError(result.error || "Pedido não encontrado");
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    listProductionWorkflows().then(res => {
      if (res.success && res.workflows.length > 0) {
        setWorkflows(res.workflows);
        setSelectedWfId(res.workflows[0].id);
      }
    });
  }, [fetchOrder]);

  const handleStatusChange = async (newStatus: string) => {
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) {
      setOrder({ ...order, status: newStatus });
    } else {
      alert(result.error);
    }
  };

  const handleStartProduction = async () => {
    if (!selectedWfId) return alert("Selecione um fluxo de produção.");
    const result = await startOrderProduction(orderId, selectedWfId);
    if (result.success) {
      setOrder({ ...order, status: 'IN_PRODUCTION' });
      setShowWfSelect(false);
    } else {
      alert(result.error);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-5 h-5 border-2 border-pw-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (error || !order) return <div className="text-center py-20 text-pw-danger">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/pedidos")} className="p-2 rounded-md text-pw-text-muted hover:text-pw-text hover:bg-pw-surface transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-pw-text flex items-center gap-2">
              Pedido #{order.orderNumber}
              <span className={`text-[10px] font-bold px-2 py-0.5 uppercase rounded border ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </h1>
            <p className="text-sm text-pw-text-muted mt-0.5">
              Criado em {new Date(order.createdAt).toLocaleString("pt-BR")} por {order.createdBy?.user?.name || "Atendente"}
            </p>
          </div>
        </div>
        
        {/* Status Actions */}
        <div className="flex items-center gap-2">
          {order.status === 'APPROVED' && !showWfSelect && (
            <button onClick={() => setShowWfSelect(true)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-2">
              Enviar p/ Produção <ArrowRight size={14} />
            </button>
          )}
          
          {order.status === 'APPROVED' && showWfSelect && (
            <div className="flex items-center gap-2 bg-pw-surface p-1 rounded-md border border-pw-border">
              <select 
                value={selectedWfId} 
                onChange={e => setSelectedWfId(e.target.value)}
                className="input-field py-1 text-xs"
              >
                {workflows.map(wf => <option key={wf.id} value={wf.id}>{wf.name}</option>)}
              </select>
              <button onClick={handleStartProduction} className="btn-primary text-xs py-1 px-3">Confirmar</button>
              <button onClick={() => setShowWfSelect(false)} className="btn-secondary text-xs py-1 px-2">X</button>
            </div>
          )}

          {order.status === 'IN_PRODUCTION' && (
            <button onClick={() => handleStatusChange('READY')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-2 bg-pw-success hover:bg-pw-success/80 text-white">
              Marcar como Pronto <Check size={14} />
            </button>
          )}
          {order.status === 'READY' && (
            <button onClick={() => handleStatusChange('DELIVERED')} className="btn-secondary border-pw-success text-pw-success text-xs py-1.5 px-3 flex items-center gap-2">
              Entregar ao Cliente <User size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Itens e Envelope */}
        <div className="col-span-2 space-y-6">
          
          {/* Envelope */}
          {order.envelope && (
            <div className="card space-y-4 border-l-4 border-l-pw-accent relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <FolderOpen size={100} />
              </div>
              <div className="flex justify-between items-center relative z-10">
                <h2 className="text-sm font-semibold text-pw-text flex items-center gap-2">
                  <FolderOpen size={16} className="text-pw-accent" /> Ficha do Laboratório
                </h2>
                {order.envelope.envelopeNumber && (
                  <span className="text-xs font-mono bg-pw-bg border border-pw-border px-2 py-1 rounded">
                    ENV: {order.envelope.envelopeNumber}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                <div>
                  <p className="text-[10px] text-pw-text-muted uppercase tracking-wider mb-1">Mídias</p>
                  <p className="text-xs font-medium">{order.envelope.receivedMaterials.join(", ") || "Nenhuma"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-pw-text-muted uppercase tracking-wider mb-1">Formato</p>
                  <p className="text-xs font-medium">{order.envelope.printSize || "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-pw-text-muted uppercase tracking-wider mb-1">Papel</p>
                  <p className="text-xs font-medium">{order.envelope.paperSurface || "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-pw-text-muted uppercase tracking-wider mb-1">Cópias</p>
                  <p className="text-xs font-medium">{order.envelope.copiesQuantity || "-"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 relative z-10">
                {order.envelope.hasIndex && <span className="text-[10px] bg-pw-bg border border-pw-border px-2 py-1 rounded-full">Índice</span>}
                {order.envelope.isProductPhoto && <span className="text-[10px] bg-pw-bg border border-pw-border px-2 py-1 rounded-full">Foto Produto</span>}
                {order.envelope.hasMontage && <span className="text-[10px] bg-pw-bg border border-pw-border px-2 py-1 rounded-full">Montagem</span>}
                {order.envelope.sendEmail && <span className="text-[10px] bg-pw-bg border border-pw-border px-2 py-1 rounded-full">Enviar E-mail</span>}
              </div>

              {order.envelope.digitalServicesNotes && (
                <div className="mt-2 p-3 bg-pw-bg border border-pw-border rounded-md relative z-10">
                  <p className="text-[10px] text-pw-text-muted uppercase tracking-wider mb-1">Anotações Laboratório</p>
                  <p className="text-xs">{order.envelope.digitalServicesNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Itens */}
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-pw-text flex items-center gap-2">
              <Package size={16} /> Itens do Pedido
            </h2>
            <div className="border border-pw-border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-pw-surface border-b border-pw-border text-pw-text-muted">
                  <tr>
                    <th className="text-left font-medium p-3">Produto/Serviço</th>
                    <th className="text-center font-medium p-3">Qtd</th>
                    <th className="text-right font-medium p-3">Unitário</th>
                    <th className="text-right font-medium p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item: any) => (
                    <tr key={item.id} className="border-b border-pw-border/30 last:border-0 bg-pw-bg">
                      <td className="p-3 font-medium">{item.product?.name || "Item Removido"}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">R$ {Number(item.unitPrice).toFixed(2)}</td>
                      <td className="p-3 text-right font-semibold">R$ {Number(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {order.status === 'APPROVED' && (
              <p className="text-[10px] text-pw-success flex items-center gap-1">
                <Check size={12} /> Estoque das matérias-primas e produtos já foram descontados automaticamente.
              </p>
            )}
          </div>

        </div>

        {/* Coluna Direita: Cliente e Financeiro */}
        <div className="col-span-1 space-y-6">
          
          {/* Cliente */}
          <div className="card">
            <h2 className="text-sm font-semibold text-pw-text flex items-center gap-2 mb-4"><User size={16} /> Cliente</h2>
            <p className="text-sm font-medium text-pw-text">{order.customer.name}</p>
            <p className="text-xs text-pw-text-muted mt-1">{order.customer.phone || order.customer.email}</p>
            <button onClick={() => router.push(`/dashboard/clientes/${order.customerId}`)} className="text-xs text-pw-accent hover:underline mt-3 inline-block">
              Ver perfil completo
            </button>
          </div>

          {/* Financeiro */}
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-pw-text flex items-center gap-2"><CreditCard size={16} /> Financeiro</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-pw-text-muted">
                <span>Subtotal</span>
                <span>R$ {Number(order.totalAmount).toFixed(2)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-pw-danger">
                  <span>Desconto</span>
                  <span>- R$ {Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-pw-border flex justify-between font-bold text-pw-text">
                <span>Total</span>
                <span>R$ {(Number(order.totalAmount) - Number(order.discount)).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-pw-border">
              <p className="text-xs text-pw-text-muted font-medium mb-3">Pagamentos Recebidos</p>
              {order.transactions.length === 0 ? (
                <p className="text-[10px] text-center text-pw-text-muted">Nenhum pagamento registrado.</p>
              ) : (
                <div className="space-y-2">
                  {order.transactions.map((t: any) => (
                    <div key={t.id} className="flex justify-between items-center text-xs p-2 bg-pw-bg border border-pw-border rounded">
                      <div>
                        <p className="font-medium">{t.category}</p>
                        <p className="text-[10px] text-pw-text-muted">{new Date(t.paidAt || t.createdAt).toLocaleDateString("pt-BR")} - {t.paymentMethod}</p>
                      </div>
                      <span className="font-bold text-pw-success">R$ {Number(t.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`mt-2 p-3 rounded-md border ${Number(order.balancePending) > 0 ? 'bg-pw-warning/10 border-pw-warning/20' : 'bg-pw-success/10 border-pw-success/20'}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-pw-text">Falta Receber</span>
                <span className={`text-sm font-bold ${Number(order.balancePending) > 0 ? 'text-pw-warning' : 'text-pw-success'}`}>
                  R$ {Number(order.balancePending).toFixed(2)}
                </span>
              </div>
              {Number(order.balancePending) > 0 && (
                <button className="w-full mt-3 btn-primary text-xs py-1.5">
                  Registrar Pagamento
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

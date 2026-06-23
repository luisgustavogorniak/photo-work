"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { listOrders } from "@/app/actions/order.actions";
import { Plus, Search, Filter, ShoppingBag, Eye, Calendar, Clock } from "lucide-react";

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

export default function PedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const result = await listOrders(statusFilter);
    if (result.success) {
      setOrders(result.orders as any[]);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-pw-text">Pedidos e Orçamentos</h1>
          <p className="text-sm text-pw-text-muted mt-1">
            Gerencie as vendas e acompanhe os envelopes de produção.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/pedidos/novo")}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Novo Pedido
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative w-48">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pw-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field pl-9 appearance-none cursor-pointer"
          >
            <option value="ALL">Todos os Status</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-pw-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-xl bg-pw-accent/10 flex items-center justify-center mb-4">
            <ShoppingBag size={28} className="text-pw-accent" />
          </div>
          <h2 className="text-base font-semibold text-pw-text mb-1">
            Nenhum pedido encontrado.
          </h2>
          <p className="text-sm text-pw-text-muted mb-4">
            Abra o seu primeiro envelope e comece a vender.
          </p>
          <button
            onClick={() => router.push("/dashboard/pedidos/novo")}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            Criar Primeiro Pedido
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div 
              key={order.id} 
              onClick={() => router.push(`/dashboard/pedidos/${order.id}`)}
              className="card p-5 cursor-pointer hover:border-pw-accent/50 transition-colors group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-pw-text-muted">#{order.orderNumber}</span>
                  <h3 className="text-base font-semibold text-pw-text mt-1">{order.customer.name}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 uppercase rounded border ${statusColors[order.status] || statusColors.BUDGET}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-pw-text-muted">
                  <Calendar size={14} />
                  <span>{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                {order.expectedDate && (
                  <div className="flex items-center gap-2 text-xs text-pw-warning">
                    <Clock size={14} />
                    <span>Entrega: {new Date(order.expectedDate).toLocaleDateString("pt-BR")}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-pw-border flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-pw-text-muted">Total do Pedido</p>
                  <p className="text-sm font-semibold text-pw-text">R$ {Number(order.totalAmount).toFixed(2)}</p>
                </div>
                {Number(order.balancePending) > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] text-pw-text-muted">Falta Pagar</p>
                    <p className="text-sm font-bold text-pw-danger">R$ {Number(order.balancePending).toFixed(2)}</p>
                  </div>
                )}
                {Number(order.balancePending) === 0 && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-pw-success px-2 py-0.5 rounded-full bg-pw-success/10 border border-pw-success/20">Pago</span>
                  </div>
                )}
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-pw-surface/90 w-full h-full flex items-center justify-center backdrop-blur-[2px]">
                <span className="btn-secondary text-sm flex items-center gap-2 shadow-lg">
                  <Eye size={16} /> Ver Detalhes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getDashboardSummary } from "@/app/actions/dashboard.actions";
import {
  Users,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Package,
  Calendar,
  DollarSign,
  Camera,
} from "lucide-react";
import Link from "next/link";

type DashboardData = {
  totalCustomers: number;
  pendingOrders: number;
  readyOrders: number;
  faturamentoMes: number;
  totalOrdersMes: number;
  alertaEstoque: { name: string; currentStock: number; minStock: number }[];
  recentOrders: {
    id: string;
    orderNumber: number;
    customerName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  BUDGET:        { label: "Orçamento",   cls: "bg-pw-text-muted/20 text-pw-text-muted" },
  APPROVED:      { label: "A Fazer",     cls: "bg-blue-500/15 text-blue-400" },
  IN_PRODUCTION: { label: "Em Prod.",    cls: "bg-yellow-500/15 text-yellow-400" },
  READY:         { label: "Pronto",      cls: "bg-pw-success/15 text-pw-success" },
  DELIVERED:     { label: "Entregue",    cls: "bg-pw-accent/15 text-pw-accent" },
  CANCELED:      { label: "Cancelado",   cls: "bg-pw-danger/15 text-pw-danger" },
};

function fmt(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "agora";
  if (diff < 60) return `${diff}min atrás`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await getDashboardSummary();
    if (res.success && res.data) setData(res.data as DashboardData);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const quickLinks = [
    { label: "Novo Pedido",    href: "/dashboard/pedidos/novo",   icon: ClipboardList, color: "text-blue-400" },
    { label: "Novo Cliente",   href: "/dashboard/clientes/novo",  icon: Users,          color: "text-pw-success" },
    { label: "Novo Produto",   href: "/dashboard/estoque/novo",   icon: Package,        color: "text-yellow-400" },
    { label: "Ver Agenda",     href: "/dashboard/producao",       icon: Calendar,       color: "text-pw-accent" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pw-text">Dashboard</h1>
          <p className="text-sm text-pw-text-muted mt-0.5">
            Visão geral da operação — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-pw-accent/10 flex items-center justify-center border border-pw-accent/20">
          <Camera size={20} className="text-pw-accent" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-pw-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-pw-text-muted">Faturamento do Mês</span>
                <DollarSign size={16} className="text-pw-accent" />
              </div>
              <span className="text-2xl font-black text-pw-text">{fmt(data?.faturamentoMes ?? 0)}</span>
              <span className="text-xs text-pw-text-muted">{data?.totalOrdersMes ?? 0} pedido(s) no mês</span>
            </div>

            <div className="card flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-pw-text-muted">A Fazer</span>
                <ClipboardList size={16} className="text-blue-400" />
              </div>
              <span className="text-2xl font-black text-pw-text">{data?.pendingOrders ?? 0}</span>
              <span className="text-xs text-pw-text-muted">pedidos na fila</span>
            </div>

            <div className="card flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-pw-text-muted">Prontos p/ Retirada</span>
                <CheckCircle2 size={16} className="text-pw-success" />
              </div>
              <span className="text-2xl font-black text-pw-text">{data?.readyOrders ?? 0}</span>
              <span className="text-xs text-pw-text-muted">aguardando cliente</span>
            </div>

            <div className="card flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-pw-text-muted">Clientes Cadastrados</span>
                <Users size={16} className="text-pw-success" />
              </div>
              <span className="text-2xl font-black text-pw-text">{data?.totalCustomers ?? 0}</span>
              <span className="text-xs text-pw-text-muted">na base</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Pedidos Recentes */}
            <div className="card lg:col-span-2 space-y-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-pw-text flex items-center gap-2">
                  <TrendingUp size={15} className="text-pw-accent" /> Últimos Pedidos
                </h2>
                <Link href="/dashboard/pedidos" className="text-xs text-pw-accent hover:underline flex items-center gap-1">
                  Ver todos <ArrowRight size={12} />
                </Link>
              </div>

              {!data?.recentOrders?.length ? (
                <div className="text-center py-8 text-sm text-pw-text-muted border border-dashed border-pw-border rounded-lg">
                  Nenhum pedido cadastrado ainda.
                  <br />
                  <Link href="/dashboard/pedidos/novo" className="text-pw-accent hover:underline mt-1 inline-block">
                    Criar primeiro pedido →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.recentOrders.map((o) => {
                    const st = STATUS_LABEL[o.status] ?? { label: o.status, cls: "" };
                    return (
                      <div
                        key={o.id}
                        onClick={() => router.push(`/dashboard/pedidos/${o.id}`)}
                        className="flex items-center justify-between p-3 rounded-lg bg-pw-bg/50 border border-pw-border/40 hover:border-pw-accent/30 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-md bg-pw-accent/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-pw-accent">#{o.orderNumber}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-pw-text truncate">{o.customerName}</p>
                            <p className="text-xs text-pw-text-muted">{timeAgo(o.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                          <span className="text-sm font-semibold text-pw-text">{fmt(o.totalAmount)}</span>
                          <ArrowRight size={14} className="text-pw-text-muted group-hover:text-pw-accent transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Coluna direita */}
            <div className="space-y-4">

              {/* Alertas de Estoque */}
              <div className="card">
                <h2 className="text-sm font-semibold text-pw-text flex items-center gap-2 mb-4">
                  <AlertTriangle size={15} className="text-yellow-400" /> Estoque Baixo
                </h2>
                {!data?.alertaEstoque?.length ? (
                  <p className="text-xs text-pw-text-muted text-center py-3">Tudo em ordem! ✅</p>
                ) : (
                  <div className="space-y-2">
                    {data.alertaEstoque.slice(0, 4).map((p) => (
                      <div key={p.name} className="flex items-center justify-between text-sm">
                        <span className="text-pw-text-muted truncate text-xs" title={p.name}>{p.name}</span>
                        <span className="text-xs font-semibold text-yellow-400 flex-shrink-0 ml-2">
                          {p.currentStock}/{p.minStock}
                        </span>
                      </div>
                    ))}
                    {data.alertaEstoque.length > 4 && (
                      <Link href="/dashboard/estoque" className="text-xs text-pw-accent hover:underline">
                        +{data.alertaEstoque.length - 4} mais →
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Acesso Rápido */}
              <div className="card">
                <h2 className="text-sm font-semibold text-pw-text mb-4">Acesso Rápido</h2>
                <div className="grid grid-cols-2 gap-2">
                  {quickLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-pw-bg/50 border border-pw-border/40 hover:border-pw-accent/30 text-center transition-all hover:bg-pw-accent/5 group"
                    >
                      <l.icon size={18} className={`${l.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-xs text-pw-text-muted group-hover:text-pw-text transition-colors leading-tight">{l.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

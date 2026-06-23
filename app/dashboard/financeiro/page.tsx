"use client";

import { useState, useEffect } from "react";
import { getFinancialDashboard } from "@/app/actions/financial.actions";
import { DollarSign, TrendingUp, ShoppingBag, AlertCircle, BarChart3, PackageOpen } from "lucide-react";

export default function FinanceiroPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const result = await getFinancialDashboard();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Erro ao carregar dashboard");
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-pw-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-pw-danger">{error}</div>;
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // Encontrar o maior valor dos últimos 6 meses para calcular a altura das barras (100%)
  const maxRevenue = Math.max(...data.last6Months.map((m: any) => m.total), 1);

  return (
    <div className="max-w-6xl pb-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-pw-text">Dashboard Financeiro</h1>
        <p className="text-sm text-pw-text-muted mt-1">
          Visão geral do faturamento e vendas do seu estúdio neste mês.
        </p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="card bg-pw-surface/80 border-pw-accent/20 p-5 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-pw-accent/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-pw-accent/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <DollarSign size={24} className="text-pw-accent opacity-50" />
          </div>
          <span className="text-sm font-semibold text-pw-text-muted">Faturamento (Mês)</span>
          <span className="text-2xl font-bold text-pw-text">{formatCurrency(data.currentMonth.faturamentoTotal)}</span>
        </div>

        <div className="card bg-pw-surface/80 border-pw-warning/20 p-5 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-pw-warning/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-pw-warning/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertCircle size={24} className="text-pw-warning opacity-50" />
          </div>
          <span className="text-sm font-semibold text-pw-text-muted">A Receber (Mês)</span>
          <span className="text-2xl font-bold text-pw-text">{formatCurrency(data.currentMonth.valoresReceber)}</span>
        </div>

        <div className="card bg-pw-surface/80 border-pw-border p-5 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-pw-border transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-pw-text-muted/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp size={24} className="text-pw-text-muted opacity-50" />
          </div>
          <span className="text-sm font-semibold text-pw-text-muted">Ticket Médio</span>
          <span className="text-2xl font-bold text-pw-text">{formatCurrency(data.currentMonth.ticketMedio)}</span>
        </div>

        <div className="card bg-pw-surface/80 border-pw-border p-5 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-pw-border transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-pw-text-muted/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShoppingBag size={24} className="text-pw-text-muted opacity-50" />
          </div>
          <span className="text-sm font-semibold text-pw-text-muted">Vendas Realizadas</span>
          <span className="text-2xl font-bold text-pw-text">{data.currentMonth.totalPedidos}</span>
        </div>

      </div>

      {/* Gráficos e Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Evolução (2 colunas) */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-base font-bold text-pw-text flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-pw-accent" /> Faturamento (Últimos 6 meses)
          </h2>
          
          <div className="h-64 flex items-end justify-between gap-2 pt-4">
            {data.last6Months.map((item: any, idx: number) => {
              const heightPercent = Math.max((item.total / maxRevenue) * 100, 2); // min 2% pra aparecer barrinha
              const isCurrentMonth = idx === data.last6Months.length - 1;

              return (
                <div key={item.month} className="flex flex-col items-center flex-1 group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-pw-text mb-2 whitespace-nowrap bg-pw-surface border border-pw-border px-2 py-1 rounded shadow-lg">
                    {formatCurrency(item.total)}
                  </div>
                  <div className="w-full max-w-[48px] bg-pw-surface border border-pw-border rounded-t-sm relative overflow-hidden h-full flex items-end">
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-500 ease-out ${isCurrentMonth ? 'bg-pw-accent' : 'bg-pw-accent/30 group-hover:bg-pw-accent/50'}`} 
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={`text-xs mt-3 ${isCurrentMonth ? 'font-bold text-pw-accent' : 'text-pw-text-muted font-medium'}`}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Produtos (1 coluna) */}
        <div className="card p-6 flex flex-col">
          <h2 className="text-base font-bold text-pw-text flex items-center gap-2 mb-6">
            <PackageOpen size={18} className="text-pw-text-muted" /> Top Produtos Vendidos
          </h2>
          
          <div className="flex-1 space-y-4">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-pw-text-muted text-center py-10 border border-dashed border-pw-border rounded-md">
                Nenhuma venda registrada no mês.
              </p>
            ) : (
              data.topProducts.map((prod: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-pw-surface/50 border border-pw-border hover:border-pw-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs ${idx === 0 ? 'bg-pw-accent text-pw-bg' : 'bg-pw-bg text-pw-text-muted'}`}>
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-pw-text truncate max-w-[140px]">{prod.name}</h4>
                      <span className="text-[10px] text-pw-text-muted">{prod.quantity} unidades</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-pw-accent">
                    {formatCurrency(prod.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

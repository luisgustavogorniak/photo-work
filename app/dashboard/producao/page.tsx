"use client";

import { useState, useEffect, useCallback } from "react";
import { getProductionAgenda, updateOrderStatus } from "@/app/actions/order.actions";
import { Calendar, CheckCircle2, Clock, FileText, Phone, ArrowRightCircle } from "lucide-react";

export default function AgendaPage() {
  const [todo, setTodo] = useState<any[]>([]);
  const [done, setDone] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgenda = useCallback(async () => {
    setLoading(true);
    const res = await getProductionAgenda();
    if (res.success) {
      setTodo(res.todo || []);
      setDone(res.done || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setLoading(true);
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.success) {
      await fetchAgenda();
    } else {
      alert("Erro ao atualizar pedido.");
      setLoading(false);
    }
  };

  const OrderCard = ({ order, isDone }: { order: any; isDone: boolean }) => {
    const isDelivered = order.status === 'DELIVERED';
    const isReady = order.status === 'READY';
    
    const cardStyle = isDelivered ? 'opacity-70 grayscale-[0.3]' : 'border-pw-accent/30';
    const stripStyle = isDelivered ? 'bg-pw-success' : 'bg-pw-accent';

    return (
      <div className={`card p-4 flex flex-col gap-3 relative overflow-hidden ${cardStyle}`}>
        {/* Strip lateral de cor */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${stripStyle}`} />
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-pw-text text-base">#{order.orderNumber} - {order.customer.name}</h3>
            {order.customer.phone && (
              <p className="text-xs text-pw-text-muted flex items-center gap-1 mt-1">
                <Phone size={12} /> {order.customer.phone}
              </p>
            )}
          </div>
          {order.expectedDate && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border ${isDelivered ? 'bg-pw-success/10 text-pw-success border-pw-success/20' : 'bg-pw-warning/10 text-pw-warning border-pw-warning/20'}`}>
              <Calendar size={12} />
              <span>{new Date(order.expectedDate).toLocaleDateString("pt-BR")}</span>
            </div>
          )}
        </div>

        {/* Serviços / Itens */}
        <div className="bg-pw-bg border border-pw-border/50 rounded-md p-2">
          <p className="text-[10px] font-bold text-pw-text-muted uppercase mb-1 flex items-center gap-1"><FileText size={10} /> Serviços Solicitados</p>
          <ul className="text-sm space-y-1">
            {order.items.map((item: any, idx: number) => (
              <li key={idx} className="flex gap-2">
                <span className="font-bold text-pw-text min-w-[20px]">{item.quantity}x</span>
                <span className="text-pw-text-muted">{item.product.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notas do Laboratório e Internas */}
        {(order.internalNotes || order.customerNotes || order.envelope?.digitalServicesNotes) && (
          <div className="text-xs space-y-2 mt-1 border-t border-pw-border/50 pt-2">
            {order.customerNotes && (
              <div>
                <span className="font-semibold text-pw-text">Nota do Cliente: </span>
                <span className="text-pw-text-muted">{order.customerNotes}</span>
              </div>
            )}
            {order.internalNotes && (
              <div>
                <span className="font-semibold text-pw-warning">Atenção Interna: </span>
                <span className="text-pw-text-muted">{order.internalNotes}</span>
              </div>
            )}
            {order.envelope?.digitalServicesNotes && (
              <div>
                <span className="font-semibold text-pw-accent">Serviços Digitais: </span>
                <span className="text-pw-text-muted">{order.envelope.digitalServicesNotes}</span>
              </div>
            )}
          </div>
        )}

        {/* Ação */}
        <div className="mt-2 flex justify-end">
          {!isDone ? (
            <button 
              onClick={() => handleUpdateStatus(order.id, "READY")}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <CheckCircle2 size={14} />
              Marcar como Finalizado
            </button>
          ) : isReady ? (
            <button 
              onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
              className="btn-primary bg-pw-success hover:bg-pw-success/90 border-pw-success text-white text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <CheckCircle2 size={14} />
              Entregue
            </button>
          ) : isDelivered ? (
            <button 
              onClick={() => handleUpdateStatus(order.id, "READY")}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              Desfazer
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pw-text">Agenda de Serviços</h1>
        <p className="text-sm text-pw-text-muted mt-1">
          Acompanhe o que precisa ser feito hoje e o que já foi finalizado.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-pw-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna A Fazer */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-pw-border">
              <Clock size={18} className="text-pw-accent" />
              <h2 className="font-bold text-pw-text">A Fazer ({todo.length})</h2>
            </div>
            
            {todo.length === 0 ? (
              <div className="card p-6 text-center border-dashed border-pw-border text-pw-text-muted">
                <p className="text-sm">Nenhum serviço pendente.</p>
              </div>
            ) : (
              todo.map(order => <OrderCard key={order.id} order={order} isDone={false} />)
            )}
          </div>

          {/* Coluna Finalizados */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-pw-border">
              <CheckCircle2 size={18} className="text-pw-success" />
              <h2 className="font-bold text-pw-text">Finalizados / Entregues ({done.length})</h2>
            </div>
            
            {done.length === 0 ? (
              <div className="card p-6 text-center border-dashed border-pw-border text-pw-text-muted">
                <p className="text-sm">Nenhum serviço finalizado ainda.</p>
              </div>
            ) : (
              done.map(order => <OrderCard key={order.id} order={order} isDone={true} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

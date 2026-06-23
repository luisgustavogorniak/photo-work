"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createOrder, CreateOrderData, OrderItemData } from "@/app/actions/order.actions";
import { listCustomers } from "@/app/actions/customer.actions";
import { listProducts } from "@/app/actions/product.actions";
import { ArrowLeft, Save, Plus, Trash2, Search, PackageOpen, Camera, FileImage, CreditCard, User, Mail, FolderOpen } from "lucide-react";

export default function NovoPedidoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data Loading
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // Form State
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<Array<OrderItemData & { name: string, maxStock?: number }>>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQty, setSelectedQty] = useState("1");
  
  // Envelope State
  const [envelope, setEnvelope] = useState({
    envelopeNumber: "",
    receivedMaterials: [] as string[],
    printSize: "",
    paperSurface: "",
    copiesQuantity: "",
    mediaQuality: "HIGH",
    hasIndex: false,
    isProductPhoto: false,
    hasMontage: false,
    sendEmail: false,
    digitalServicesNotes: ""
  });

  // Financial State
  const [discount, setDiscount] = useState("0");
  const [advancePayment, setAdvancePayment] = useState("0");

  const loadData = useCallback(async () => {
    const [custRes, prodRes] = await Promise.all([
      listCustomers(""),
      listProducts("")
    ]);
    
    if (custRes.success) setCustomers(custRes.customers as any[]);
    if (prodRes.success) {
      // Don't sell raw materials directly in the UI for now to keep it simple, only finished goods and services
      const sellable = (prodRes.products as any[]).filter(p => p.type !== 'RAW_MATERIAL');
      setProducts(sellable);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived Totals
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0), [items]);
  const finalTotal = useMemo(() => Math.max(0, subtotal - Number(discount)), [subtotal, discount]);
  const balancePending = useMemo(() => Math.max(0, finalTotal - Number(advancePayment)), [finalTotal, advancePayment]);

  // Handlers
  const handleAddItem = () => {
    if (!selectedProductId) return;
    const qty = Number(selectedQty);
    if (qty <= 0) return;

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    setItems(prev => {
      const existing = prev.find(i => i.productId === selectedProductId);
      if (existing) {
        return prev.map(i => i.productId === selectedProductId 
          ? { ...i, quantity: i.quantity + qty } 
          : i);
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        unitPrice: Number(product.sellingPrice), 
        quantity: qty 
      }];
    });

    setSelectedProductId("");
    setSelectedQty("1");
  };

  const handleRemoveItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleMaterial = (mat: string) => {
    setEnvelope(prev => {
      if (prev.receivedMaterials.includes(mat)) {
        return { ...prev, receivedMaterials: prev.receivedMaterials.filter(m => m !== mat) };
      }
      return { ...prev, receivedMaterials: [...prev.receivedMaterials, mat] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return setError("Selecione um cliente.");
    if (items.length === 0) return setError("Adicione pelo menos um item ao pedido.");
    
    setLoading(true);
    setError(null);

    const payload: CreateOrderData = {
      customerId,
      items: items.map(({ productId, quantity, unitPrice }) => ({ productId, quantity, unitPrice })),
      envelope: {
        ...envelope,
        copiesQuantity: Number(envelope.copiesQuantity) || 0
      },
      totalAmount: subtotal,
      discount: Number(discount) || 0,
      advancePayment: Number(advancePayment) || 0,
    };

    const result = await createOrder(payload);
    
    if (result.success) {
      router.push(`/dashboard/pedidos/${result.orderId}`);
    } else {
      setError(result.error || "Erro ao criar pedido");
      setLoading(false);
    }
  };

  const mediaOptions = [
    { id: "MEMORY_CARD", label: "Cartão de Memória" },
    { id: "SMARTPHONE", label: "Celular" },
    { id: "PENDRIVE", label: "PenDrive" },
    { id: "INTERNET", label: "Internet / WhatsApp" },
    { id: "PHOTO", label: "Foto Papel (Escâner)" },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/dashboard/pedidos")} className="p-2 rounded-md text-pw-text-muted hover:text-pw-text hover:bg-pw-surface transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-pw-text">Novo Pedido no Balcão</h1>
          <p className="text-sm text-pw-text-muted mt-0.5">Preencha o envelope digital e adicione os produtos.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-md text-sm bg-pw-danger/15 text-pw-danger border border-pw-danger/30">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Cliente, Carrinho e Financeiro */}
        <div className="col-span-2 space-y-6">
          
          {/* Cliente */}
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-pw-text flex items-center gap-2"><User size={16} /> 1. Cliente</h2>
            <div className="flex gap-2">
              <select 
                value={customerId} 
                onChange={e => setCustomerId(e.target.value)} 
                className="input-field flex-1"
                required
              >
                <option value="">Selecione um cliente...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone || c.email})</option>
                ))}
              </select>
              <button type="button" onClick={() => router.push("/dashboard/clientes/novo")} className="btn-secondary px-4 whitespace-nowrap">
                Novo Cliente
              </button>
            </div>
          </div>

          {/* Carrinho de Produtos */}
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-pw-text flex items-center gap-2"><PackageOpen size={16} /> 2. Produtos e Serviços</h2>
            
            <div className="flex gap-3 bg-pw-bg p-3 rounded-md border border-pw-border/50">
              <div className="flex-1">
                <select 
                  value={selectedProductId} 
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Adicionar produto ou serviço...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - R$ {Number(p.sellingPrice).toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <input 
                  type="number" min="1" 
                  value={selectedQty} 
                  onChange={e => setSelectedQty(e.target.value)}
                  className="input-field text-sm"
                  placeholder="Qtd"
                />
              </div>
              <button type="button" onClick={handleAddItem} className="btn-primary text-sm px-4">Adicionar</button>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-center py-6 text-pw-text-muted border border-dashed border-pw-border rounded-md">
                Carrinho vazio.
              </p>
            ) : (
              <div className="border border-pw-border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-pw-surface border-b border-pw-border text-pw-text-muted">
                    <tr>
                      <th className="text-left font-medium p-3">Item</th>
                      <th className="text-center font-medium p-3">Qtd</th>
                      <th className="text-right font-medium p-3">Unitário</th>
                      <th className="text-right font-medium p-3">Total</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-pw-border/30 last:border-0 bg-pw-bg">
                        <td className="p-3 font-medium">{item.name}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">R$ {item.unitPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-semibold">R$ {(item.quantity * item.unitPrice).toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <button type="button" onClick={() => handleRemoveItem(idx)} className="text-pw-danger hover:text-red-400">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Envelope Fotográfico (Digitalizado) */}
          <div className="card space-y-5 border-l-4 border-l-pw-accent">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-pw-text flex items-center gap-2">
                <FolderOpen size={16} className="text-pw-accent" /> 3. Envelope Físico / Laboratório
              </h2>
              <div className="w-32">
                <input 
                  type="text" 
                  placeholder="Nº Envelope" 
                  value={envelope.envelopeNumber}
                  onChange={e => setEnvelope({...envelope, envelopeNumber: e.target.value})}
                  className="input-field text-xs py-1.5"
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-pw-text-muted mb-2">Mídia Recebida</p>
              <div className="flex flex-wrap gap-2">
                {mediaOptions.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleMaterial(opt.id)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      envelope.receivedMaterials.includes(opt.id) 
                        ? 'bg-pw-accent/20 border-pw-accent text-pw-accent' 
                        : 'border-pw-border text-pw-text-muted hover:border-pw-text-muted'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-pw-text-muted mb-1">Tamanho da Impressão</p>
                <input type="text" placeholder="Ex: 10x15" value={envelope.printSize} onChange={e => setEnvelope({...envelope, printSize: e.target.value})} className="input-field" />
              </div>
              <div>
                <p className="text-xs text-pw-text-muted mb-1">Tipo de Papel</p>
                <input type="text" placeholder="Ex: Brilho, Fosco" value={envelope.paperSurface} onChange={e => setEnvelope({...envelope, paperSurface: e.target.value})} className="input-field" />
              </div>
              <div>
                <p className="text-xs text-pw-text-muted mb-1">Qtd de Cópias</p>
                <input type="number" placeholder="Ex: 1" value={envelope.copiesQuantity} onChange={e => setEnvelope({...envelope, copiesQuantity: e.target.value})} className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-pw-bg p-3 rounded-md border border-pw-border">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={envelope.hasIndex} onChange={e => setEnvelope({...envelope, hasIndex: e.target.checked})} className="accent-pw-accent" />
                Fazer Índice
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={envelope.isProductPhoto} onChange={e => setEnvelope({...envelope, isProductPhoto: e.target.checked})} className="accent-pw-accent" />
                Foto Produto
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={envelope.hasMontage} onChange={e => setEnvelope({...envelope, hasMontage: e.target.checked})} className="accent-pw-accent" />
                Montagem
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer text-pw-accent">
                <input type="checkbox" checked={envelope.sendEmail} onChange={e => setEnvelope({...envelope, sendEmail: e.target.checked})} className="accent-pw-accent" />
                Enviar P/ E-mail
              </label>
            </div>

            <div>
              <p className="text-xs text-pw-text-muted mb-1">Anotações para o Laboratório / Serviços Digitais</p>
              <textarea 
                rows={2} 
                placeholder="Ex: Cortar bordas brancas, remover manchas na foto 3..."
                value={envelope.digitalServicesNotes}
                onChange={e => setEnvelope({...envelope, digitalServicesNotes: e.target.value})}
                className="input-field resize-none"
              />
            </div>
          </div>

        </div>

        {/* Coluna Direita: Resumo Financeiro */}
        <div className="col-span-1">
          <div className="card sticky top-6">
            <h2 className="text-sm font-semibold text-pw-text flex items-center gap-2 mb-4"><CreditCard size={16} /> 4. Fechamento</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-pw-text-muted">
                <span>Subtotal Itens</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-pw-text-muted whitespace-nowrap">Desconto (-) R$</span>
                <input 
                  type="number" step="0.01" min="0" 
                  value={discount} 
                  onChange={e => setDiscount(e.target.value)} 
                  className="input-field text-right text-sm py-1.5 w-24"
                />
              </div>

              <div className="pt-3 border-t border-pw-border flex justify-between text-base font-bold text-pw-text">
                <span>Total Final</span>
                <span className="text-pw-accent">R$ {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-pw-bg p-3 rounded-md border border-pw-border mb-6">
              <p className="text-xs text-pw-text-muted mb-2 font-medium">Sinal / Adiantamento</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-pw-text-muted">R$</span>
                <input 
                  type="number" step="0.01" min="0" 
                  max={finalTotal}
                  value={advancePayment} 
                  onChange={e => setAdvancePayment(e.target.value)} 
                  className="input-field text-right"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-pw-text-muted">Falta receber:</span>
                <span className={`font-bold ${balancePending > 0 ? 'text-pw-warning' : 'text-pw-success'}`}>
                  R$ {balancePending.toFixed(2)}
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || items.length === 0} 
              className="btn-primary w-full py-3 text-base flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Processando..." : <><Save size={18} /> Confirmar Pedido</>}
            </button>
            <p className="text-[10px] text-center text-pw-text-muted mt-3">
              Ao confirmar, o estoque será descontado automaticamente.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  getProductById, 
  updateProduct, 
  adjustInventory, 
  addProductComponent, 
  removeProductComponent,
  listProducts
} from "@/app/actions/product.actions";
import { ArrowLeft, Save, Trash2, Pencil, X, Package, Box, TrendingUp, TrendingDown, Layers } from "lucide-react";

export default function ProductProfilePage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for Stock Adjustment
  const [adjustingStock, setAdjustingStock] = useState(false);
  const [adjType, setAdjType] = useState<"IN" | "OUT">("IN");
  const [adjQty, setAdjQty] = useState("");
  const [adjReason, setAdjReason] = useState("");

  // States for Bill of Materials (Ficha Técnica)
  const [availableMaterials, setAvailableMaterials] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [materialQty, setMaterialQty] = useState("");

  const loadProduct = useCallback(async () => {
    setLoading(true);
    const result = await getProductById(productId);
    if (result.success) {
      setProduct(result.product);
    } else {
      setError(result.error || "Produto não encontrado.");
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Load raw materials when rendering a FINISHED_GOOD
  useEffect(() => {
    if (product && product.type === "FINISHED_GOOD") {
      listProducts("", "RAW_MATERIAL").then(res => {
        if (res.success) {
          // Filter out materials already in the BOM
          const existingIds = product.components.map((c: any) => c.childProductId);
          setAvailableMaterials((res.products as any[]).filter(p => !existingIds.includes(p.id)));
        }
      });
    }
  }, [product]);

  async function handleSaveBasic(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product) return;
    const formData = new FormData(e.currentTarget);
    const result = await updateProduct(product.id, {
      name: formData.get("name") as string,
      type: product.type,
      costPrice: Number(formData.get("costPrice")) || 0,
      sellingPrice: Number(formData.get("sellingPrice")) || 0,
      minStock: Number(formData.get("minStock")) || 0,
      unitMeasure: formData.get("unitMeasure") as string,
    });
    if (result.success) {
      setProduct({ ...product, ...(result.product as any) });
      setEditing(false);
    } else {
      alert(result.error);
    }
  }

  async function handleAdjustStock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const qty = Number(adjQty);
    if (!qty || qty <= 0) return alert("Quantidade inválida");
    if (!adjReason.trim()) return alert("Informe o motivo");

    const result = await adjustInventory(product.id, qty, adjType, adjReason);
    if (result.success) {
      setAdjustingStock(false);
      setAdjQty("");
      setAdjReason("");
      loadProduct(); // Reload to get new stock and movements
    } else {
      alert(result.error);
    }
  }

  async function handleAddMaterial(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedMaterial) return alert("Selecione um insumo");
    const qty = Number(materialQty);
    if (!qty || qty <= 0) return alert("Quantidade inválida");

    const result = await addProductComponent(product.id, {
      childProductId: selectedMaterial,
      quantityRequired: qty
    });

    if (result.success) {
      setSelectedMaterial("");
      setMaterialQty("");
      loadProduct(); // Reload BOM
    } else {
      alert(result.error);
    }
  }

  async function handleRemoveMaterial(componentId: string) {
    if (!confirm("Remover este insumo da ficha técnica?")) return;
    const result = await removeProductComponent(componentId);
    if (result.success) {
      loadProduct();
    } else {
      alert(result.error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-pw-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="card text-center py-12">
        <p className="text-pw-danger mb-4">{error}</p>
        <button onClick={() => router.push("/dashboard/estoque")} className="btn-secondary text-sm">
          Voltar para Estoque
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/estoque")} className="p-2 rounded-md text-pw-text-muted hover:text-pw-text hover:bg-pw-surface">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-pw-text">{product.name}</h1>
            <p className="text-sm text-pw-text-muted mt-0.5">
              {product.type === "FINISHED_GOOD" ? "Produto Final" : product.type === "RAW_MATERIAL" ? "Matéria-prima" : "Serviço"}
            </p>
          </div>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-secondary text-sm flex items-center gap-2">
            <Pencil size={14} /> Editar Base
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Coluna Esquerda: Info & Ficha Técnica */}
        <div className="col-span-2 space-y-6">
          
          {editing ? (
            <form onSubmit={handleSaveBasic} className="card space-y-4">
              <h2 className="text-sm font-semibold text-pw-text mb-4">Editar Informações</h2>
              <div>
                <label className="form-label">Nome</label>
                <input name="name" defaultValue={product.name} required className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Custo (R$)</label><input name="costPrice" type="number" step="0.01" defaultValue={product.costPrice} className="input-field" /></div>
                <div><label className="form-label">Venda (R$)</label><input name="sellingPrice" type="number" step="0.01" defaultValue={product.sellingPrice} className="input-field" /></div>
              </div>
              {product.type !== "SERVICE" && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="form-label">Estoque Mínimo</label><input name="minStock" type="number" step="0.01" defaultValue={product.minStock} className="input-field" /></div>
                  <div>
                    <label className="form-label">Unidade Medida</label>
                    <select name="unitMeasure" defaultValue={product.unitMeasure} className="input-field">
                      <option value="UN">UN</option><option value="M">M</option><option value="M2">M²</option><option value="KG">KG</option><option value="L">L</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary text-sm flex-1">Salvar</button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm flex-1">Cancelar</button>
              </div>
            </form>
          ) : (
            <div className="card grid grid-cols-3 gap-4">
               <div>
                 <p className="text-xs text-pw-text-muted mb-1">Preço Custo</p>
                 <p className="text-sm font-medium">R$ {Number(product.costPrice).toFixed(2)}</p>
               </div>
               <div>
                 <p className="text-xs text-pw-text-muted mb-1">Preço Venda</p>
                 <p className="text-sm font-medium">R$ {Number(product.sellingPrice).toFixed(2)}</p>
               </div>
               {product.type !== "SERVICE" && (
                 <div>
                   <p className="text-xs text-pw-text-muted mb-1">Estoque Mínimo</p>
                   <p className="text-sm font-medium">{product.minStock} {product.unitMeasure}</p>
                 </div>
               )}
            </div>
          )}

          {/* FICHA TÉCNICA (Se for Produto Final) */}
          {product.type === "FINISHED_GOOD" && (
            <div className="card">
              <h2 className="text-sm font-semibold text-pw-text mb-4 flex items-center gap-2">
                <Layers size={18} /> Ficha Técnica (BOM)
              </h2>
              <p className="text-xs text-pw-text-muted mb-6">
                Defina as matérias-primas que compõem este produto. O estoque delas será descontado automaticamente na venda.
              </p>

              <form onSubmit={handleAddMaterial} className="flex gap-3 mb-6 bg-pw-bg p-3 rounded-md border border-pw-border/50">
                <div className="flex-1">
                  <select 
                    value={selectedMaterial} 
                    onChange={e => setSelectedMaterial(e.target.value)}
                    className="input-field text-sm"
                    required
                  >
                    <option value="">Adicionar insumo...</option>
                    {availableMaterials.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.unitMeasure})</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <input 
                    type="number" step="0.01" min="0.01" 
                    placeholder="Qtd" 
                    value={materialQty} 
                    onChange={e => setMaterialQty(e.target.value)}
                    required
                    className="input-field text-sm"
                  />
                </div>
                <button type="submit" className="btn-primary text-sm px-4">Add</button>
              </form>

              {product.components.length === 0 ? (
                <p className="text-sm text-center py-4 text-pw-text-muted border border-dashed border-pw-border rounded-md">
                  Nenhum insumo configurado.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-pw-border text-pw-text-muted">
                    <tr><th className="text-left pb-2 font-medium">Insumo</th><th className="text-center pb-2 font-medium">Quantidade</th><th className="text-right pb-2 font-medium"></th></tr>
                  </thead>
                  <tbody>
                    {product.components.map((c: any) => (
                      <tr key={c.id} className="border-b border-pw-border/30 last:border-0">
                        <td className="py-3">{c.childProduct.name}</td>
                        <td className="py-3 text-center text-pw-accent font-medium">{c.quantityRequired} {c.childProduct.unitMeasure}</td>
                        <td className="py-3 text-right">
                          <button onClick={() => handleRemoveMaterial(c.id)} className="text-pw-danger hover:underline text-xs">Remover</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Coluna Direita: Estoque Atual & Movimentações */}
        {product.type !== "SERVICE" && (
          <div className="col-span-1 space-y-6">
            
            <div className="card text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-pw-accent" />
              <h2 className="text-sm text-pw-text-muted mb-1">Estoque Atual</h2>
              <p className="text-4xl font-bold text-pw-text my-2">{product.currentStock} <span className="text-lg font-normal text-pw-text-muted">{product.unitMeasure}</span></p>
              
              {adjustingStock ? (
                <form onSubmit={handleAdjustStock} className="mt-4 text-left space-y-3 bg-pw-bg p-3 rounded-md border border-pw-border">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setAdjType("IN")} className={`flex-1 py-1.5 text-xs rounded border ${adjType === 'IN' ? 'bg-pw-success/20 border-pw-success text-pw-success' : 'border-pw-border text-pw-text-muted'}`}>Entrada</button>
                    <button type="button" onClick={() => setAdjType("OUT")} className={`flex-1 py-1.5 text-xs rounded border ${adjType === 'OUT' ? 'bg-pw-danger/20 border-pw-danger text-pw-danger' : 'border-pw-border text-pw-text-muted'}`}>Saída</button>
                  </div>
                  <input type="number" step="0.01" placeholder="Quantidade" value={adjQty} onChange={e => setAdjQty(e.target.value)} required className="input-field text-sm py-1.5" />
                  <input type="text" placeholder="Motivo (ex: Compra, Perda)" value={adjReason} onChange={e => setAdjReason(e.target.value)} required className="input-field text-sm py-1.5" />
                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="btn-primary text-xs py-1.5 flex-1">Confirmar</button>
                    <button type="button" onClick={() => setAdjustingStock(false)} className="btn-secondary text-xs py-1.5 flex-1">Cancelar</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setAdjustingStock(true)} className="btn-secondary w-full text-sm mt-4">Ajustar Estoque</button>
              )}
            </div>

            <div className="card">
              <h2 className="text-sm font-semibold text-pw-text mb-4 flex items-center gap-2">
                <Box size={16} /> Movimentações Recentes
              </h2>
              {product.movements.length === 0 ? (
                <p className="text-xs text-center text-pw-text-muted">Nenhuma movimentação.</p>
              ) : (
                <div className="space-y-3">
                  {product.movements.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between border-b border-pw-border/30 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        {m.type === "IN" ? <TrendingUp size={16} className="text-pw-success" /> : <TrendingDown size={16} className="text-pw-danger" />}
                        <div>
                          <p className="text-xs font-medium">{m.reason}</p>
                          <p className="text-[10px] text-pw-text-muted">{new Date(m.date).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${m.type === "IN" ? "text-pw-success" : "text-pw-danger"}`}>
                        {m.type === "IN" ? "+" : "-"}{m.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { listProducts, deleteProduct } from "@/app/actions/product.actions";
import {
  Plus,
  Search,
  Package,
  Trash2,
  Eye,
  Filter,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  type: string;
  costPrice: any;
  sellingPrice: any;
  currentStock: number;
  minStock: number;
  unitMeasure: string;
};

const typeLabels: Record<string, string> = {
  RAW_MATERIAL: "Matéria-prima",
  FINISHED_GOOD: "Produto Final",
  SERVICE: "Serviço",
};

export default function EstoquePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = useCallback(async (searchTerm?: string, filter?: string) => {
    setLoading(true);
    const result = await listProducts(searchTerm, filter);
    if (result.success) {
      setProducts(result.products as Product[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts("", typeFilter);
  }, [fetchProducts, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(search, typeFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, typeFilter, fetchProducts]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja remover "${name}"?`)) return;

    setDeleting(id);
    const result = await deleteProduct(id);

    if (result.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert(result.error);
    }
    setDeleting(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-pw-text">Estoque e Produtos</h1>
          <p className="text-sm text-pw-text-muted mt-1">
            Gerencie produtos finais, serviços e matérias-primas.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/estoque/novo")}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Novo Produto
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pw-text-muted" />
          <input
            type="text"
            placeholder="Buscar produto por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="relative w-48">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pw-text-muted" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field pl-9 appearance-none cursor-pointer"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="FINISHED_GOOD">Produtos Finais</option>
            <option value="RAW_MATERIAL">Matérias-primas</option>
            <option value="SERVICE">Serviços</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-pw-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-xl bg-pw-accent/10 flex items-center justify-center mb-4">
            <Package size={28} className="text-pw-accent" />
          </div>
          <h2 className="text-base font-semibold text-pw-text mb-1">
            Nenhum item encontrado no estoque.
          </h2>
          <p className="text-sm text-pw-text-muted mb-4">
            Cadastre papéis, molduras, quadros prontos ou serviços.
          </p>
          {!search && (
            <button
              onClick={() => router.push("/dashboard/estoque/novo")}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Cadastrar Primeiro Item
            </button>
          )}
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pw-border">
                <th className="text-left text-xs font-semibold text-pw-text-muted uppercase tracking-wider px-5 py-3">Produto</th>
                <th className="text-center text-xs font-semibold text-pw-text-muted uppercase tracking-wider px-5 py-3">Tipo</th>
                <th className="text-center text-xs font-semibold text-pw-text-muted uppercase tracking-wider px-5 py-3">Estoque Atual</th>
                <th className="text-right text-xs font-semibold text-pw-text-muted uppercase tracking-wider px-5 py-3">Preço Venda</th>
                <th className="text-right text-xs font-semibold text-pw-text-muted uppercase tracking-wider px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-pw-border/50 hover:bg-pw-bg/50">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-pw-text">{product.name}</p>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-pw-surface border border-pw-border`}>
                      {typeLabels[product.type] || product.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {product.type === "SERVICE" ? (
                      <span className="text-pw-text-muted text-sm">—</span>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-medium ${product.currentStock <= product.minStock ? "text-pw-warning" : "text-pw-text"}`}>
                          {product.currentStock} {product.unitMeasure}
                        </span>
                        {product.currentStock <= product.minStock && (
                          <span className="text-[10px] text-pw-warning font-semibold uppercase tracking-wider">Estoque Baixo</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm font-medium text-pw-text">
                      {product.type === "RAW_MATERIAL" ? "—" : `R$ ${Number(product.sellingPrice).toFixed(2)}`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/dashboard/estoque/${product.id}`)}
                        className="p-2 rounded-md text-pw-text-muted hover:text-pw-accent hover:bg-pw-bg"
                        title="Ver detalhes"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleting === product.id}
                        className="p-2 rounded-md text-pw-text-muted hover:text-pw-danger hover:bg-pw-bg disabled:opacity-50"
                        title="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

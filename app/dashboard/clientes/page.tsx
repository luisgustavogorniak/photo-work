"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { listCustomers, deleteCustomer } from "@/app/actions/customer.actions";
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  Trash2,
  Eye,
  ShoppingBag,
} from "lucide-react";

type Customer = {
  id: string;
  type: string;
  name: string;
  document: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  createdAt: Date;
  _count: { orders: number };
};

export default function ClientesPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCustomers = useCallback(async (searchTerm?: string) => {
    setLoading(true);
    const result = await listCustomers(searchTerm);
    if (result.success) {
      setCustomers(result.customers as Customer[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounce de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchCustomers]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja remover o cliente "${name}"? Essa ação não pode ser desfeita.`)) {
      return;
    }

    setDeleting(id);
    const result = await deleteCustomer(id);

    if (result.success) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert(result.error);
    }
    setDeleting(null);
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-pw-text">Clientes</h1>
          <p className="text-sm text-pw-text-muted mt-1">
            Gerencie o cadastro e o histórico dos seus clientes.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/clientes/novo")}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-pw-text-muted"
        />
        <input
          type="text"
          placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {/* Estado de carregamento */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-pw-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Estado vazio */}
      {!loading && customers.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-xl bg-pw-accent/10 flex items-center justify-center mb-4">
            <Users size={28} className="text-pw-accent" />
          </div>
          <h2 className="text-base font-semibold text-pw-text mb-1">
            {search
              ? "Nenhum cliente encontrado."
              : "Nenhum cliente cadastrado ainda."}
          </h2>
          <p className="text-sm text-pw-text-muted mb-4">
            {search
              ? "Tente buscar com outros termos."
              : "Comece cadastrando o primeiro cliente do seu estúdio."}
          </p>
          {!search && (
            <button
              onClick={() => router.push("/dashboard/clientes/novo")}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Cadastrar Cliente
            </button>
          )}
        </div>
      )}

      {/* Tabela de clientes */}
      {!loading && customers.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pw-border">
                <th className="text-left text-xs font-semibold text-pw-text-muted uppercase tracking-wider px-5 py-3">
                  Cliente
                </th>
                <th className="text-left text-xs font-semibold text-pw-text-muted uppercase tracking-wider px-5 py-3">
                  Contato
                </th>
                <th className="text-center text-xs font-semibold text-pw-text-muted uppercase tracking-wider px-5 py-3">
                  Tipo
                </th>
                <th className="text-center text-xs font-semibold text-pw-text-muted uppercase tracking-wider px-5 py-3">
                  Pedidos
                </th>
                <th className="text-right text-xs font-semibold text-pw-text-muted uppercase tracking-wider px-5 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-pw-border/50 last:border-0 hover:bg-pw-bg/50 transition-colors duration-100"
                >
                  {/* Nome e Documento */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-pw-text">
                      {customer.name}
                    </p>
                    {customer.document && (
                      <p className="text-xs text-pw-text-muted mt-0.5">
                        {customer.document}
                      </p>
                    )}
                  </td>

                  {/* Contato */}
                  <td className="px-5 py-3.5">
                    <div className="space-y-1">
                      {(customer.whatsapp || customer.phone) && (
                        <p className="flex items-center gap-1.5 text-xs text-pw-text-muted">
                          <Phone size={12} />
                          {customer.whatsapp || customer.phone}
                        </p>
                      )}
                      {customer.email && (
                        <p className="flex items-center gap-1.5 text-xs text-pw-text-muted">
                          <Mail size={12} />
                          {customer.email}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                        customer.type === "PJ"
                          ? "bg-pw-accent/10 text-pw-accent"
                          : "bg-pw-text-muted/10 text-pw-text-muted"
                      }`}
                    >
                      {customer.type === "PJ" ? "Empresa" : "Pessoa"}
                    </span>
                  </td>

                  {/* Pedidos */}
                  <td className="px-5 py-3.5 text-center">
                    <span className="flex items-center justify-center gap-1.5 text-sm text-pw-text-muted">
                      <ShoppingBag size={14} />
                      {customer._count.orders}
                    </span>
                  </td>

                  {/* Ações */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/clientes/${customer.id}`)
                        }
                        className="p-2 rounded-md text-pw-text-muted hover:text-pw-accent hover:bg-pw-bg transition-all duration-150"
                        title="Ver perfil"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(customer.id, customer.name)
                        }
                        disabled={deleting === customer.id}
                        className="p-2 rounded-md text-pw-text-muted hover:text-pw-danger hover:bg-pw-bg transition-all duration-150 disabled:opacity-50"
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

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCustomerById, updateCustomer, deleteCustomer } from "@/app/actions/customer.actions";
import {
  ArrowLeft,
  Save,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Heart,
  ShoppingBag,
  Pencil,
  X,
} from "lucide-react";

type CustomerData = {
  id: string;
  type: string;
  name: string;
  document: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  birthDate: Date | string | null;
  notes: string | null;
  preferences: string | null;
  createdAt: Date | string;
  orders: Array<{
    id: string;
    orderNumber: number;
    status: string;
    totalAmount: any;
    createdAt: Date | string;
  }>;
};

const statusLabels: Record<string, { label: string; color: string }> = {
  BUDGET: { label: "Orçamento", color: "text-pw-text-muted" },
  APPROVED: { label: "Aprovado", color: "text-pw-accent" },
  IN_PRODUCTION: { label: "Em Produção", color: "text-pw-warning" },
  READY: { label: "Pronto", color: "text-pw-success" },
  DELIVERED: { label: "Entregue", color: "text-pw-success" },
  CANCELED: { label: "Cancelado", color: "text-pw-danger" },
};

export default function CustomerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getCustomerById(customerId);
      if (result.success && result.customer) {
        setCustomer(result.customer as unknown as CustomerData);
      } else {
        setError(result.error || "Cliente não encontrado.");
      }
      setLoading(false);
    }
    load();
  }, [customerId]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!customer) return;

    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await updateCustomer(customer.id, {
      type: customer.type as "PF" | "PJ",
      name: formData.get("name") as string,
      document: formData.get("document") as string,
      phone: formData.get("phone") as string,
      whatsapp: formData.get("whatsapp") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      birthDate: formData.get("birthDate") as string,
      notes: formData.get("notes") as string,
      preferences: formData.get("preferences") as string,
    });

    setSaving(false);

    if (result.success) {
      setCustomer({ ...customer, ...(result.customer as any) });
      setEditing(false);
    } else {
      setError(result.error || "Erro ao salvar.");
    }
  }

  async function handleDelete() {
    if (!customer) return;
    if (
      !confirm(
        `Tem certeza que deseja remover "${customer.name}"? Essa ação não pode ser desfeita.`
      )
    )
      return;

    const result = await deleteCustomer(customer.id);
    if (result.success) {
      router.push("/dashboard/clientes");
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

  if (error && !customer) {
    return (
      <div className="card text-center py-12">
        <p className="text-pw-danger mb-4">{error}</p>
        <button
          onClick={() => router.push("/dashboard/clientes")}
          className="btn-secondary text-sm"
        >
          Voltar para Clientes
        </button>
      </div>
    );
  }

  if (!customer) return null;

  const formatDate = (d: Date | string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("pt-BR");
  };

  return (
    <div className="max-w-3xl">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/clientes")}
            className="p-2 rounded-md text-pw-text-muted hover:text-pw-text hover:bg-pw-surface transition-all duration-150"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-pw-text">
              {customer.name}
            </h1>
            <p className="text-sm text-pw-text-muted mt-0.5">
              {customer.type === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"} ·
              Cliente desde {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <Pencil size={14} />
              Editar
            </button>
          ) : (
            <button
              onClick={() => setEditing(false)}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <X size={14} />
              Cancelar
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2 rounded-md text-pw-text-muted hover:text-pw-danger hover:bg-pw-surface transition-all duration-150"
            title="Remover cliente"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-md text-sm bg-pw-danger/15 text-pw-danger border border-pw-danger/30">
          {error}
        </div>
      )}

      {editing ? (
        /* ==================== MODO EDIÇÃO ==================== */
        <form onSubmit={handleSave} className="space-y-6">
          <div className="card space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nome *</label>
                <input
                  name="name"
                  defaultValue={customer.name}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">
                  {customer.type === "PF" ? "CPF" : "CNPJ"}
                </label>
                <input
                  name="document"
                  defaultValue={customer.document || ""}
                  className="input-field"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Telefone</label>
                <input
                  name="phone"
                  defaultValue={customer.phone || ""}
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">WhatsApp</label>
                <input
                  name="whatsapp"
                  defaultValue={customer.whatsapp || ""}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="form-label">E-mail</label>
              <input
                name="email"
                defaultValue={customer.email || ""}
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Endereço</label>
              <input
                name="address"
                defaultValue={customer.address || ""}
                className="input-field"
              />
            </div>
            {customer.type === "PF" && (
              <div>
                <label className="form-label">Data de Nascimento</label>
                <input
                  name="birthDate"
                  type="date"
                  defaultValue={
                    customer.birthDate
                      ? new Date(customer.birthDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  className="input-field"
                />
              </div>
            )}
            <div>
              <label className="form-label">Observações</label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={customer.notes || ""}
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="form-label">Preferências</label>
              <textarea
                name="preferences"
                rows={2}
                defaultValue={customer.preferences || ""}
                className="input-field resize-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? "Salvando..." : (
              <>
                <Save size={16} />
                Salvar Alterações
              </>
            )}
          </button>
        </form>
      ) : (
        /* ==================== MODO VISUALIZAÇÃO ==================== */
        <div className="space-y-6">
          {/* Dados de Contato */}
          <div className="card">
            <h2 className="text-sm font-semibold text-pw-text mb-4">
              Informações de Contato
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {customer.document && (
                <div className="flex items-start gap-2.5">
                  <FileText
                    size={16}
                    className="text-pw-text-muted mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs text-pw-text-muted">
                      {customer.type === "PF" ? "CPF" : "CNPJ"}
                    </p>
                    <p className="text-sm text-pw-text">{customer.document}</p>
                  </div>
                </div>
              )}
              {(customer.phone || customer.whatsapp) && (
                <div className="flex items-start gap-2.5">
                  <Phone
                    size={16}
                    className="text-pw-text-muted mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs text-pw-text-muted">
                      {customer.whatsapp ? "WhatsApp" : "Telefone"}
                    </p>
                    <p className="text-sm text-pw-text">
                      {customer.whatsapp || customer.phone}
                    </p>
                  </div>
                </div>
              )}
              {customer.email && (
                <div className="flex items-start gap-2.5">
                  <Mail
                    size={16}
                    className="text-pw-text-muted mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs text-pw-text-muted">E-mail</p>
                    <p className="text-sm text-pw-text">{customer.email}</p>
                  </div>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin
                    size={16}
                    className="text-pw-text-muted mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs text-pw-text-muted">Endereço</p>
                    <p className="text-sm text-pw-text">{customer.address}</p>
                  </div>
                </div>
              )}
              {customer.birthDate && (
                <div className="flex items-start gap-2.5">
                  <Calendar
                    size={16}
                    className="text-pw-text-muted mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-xs text-pw-text-muted">Nascimento</p>
                    <p className="text-sm text-pw-text">
                      {formatDate(customer.birthDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preferências */}
          {(customer.notes || customer.preferences) && (
            <div className="card">
              <h2 className="text-sm font-semibold text-pw-text mb-4">
                Observações e Preferências
              </h2>
              <div className="space-y-3">
                {customer.notes && (
                  <div className="flex items-start gap-2.5">
                    <FileText
                      size={16}
                      className="text-pw-text-muted mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-xs text-pw-text-muted">Observações</p>
                      <p className="text-sm text-pw-text whitespace-pre-line">
                        {customer.notes}
                      </p>
                    </div>
                  </div>
                )}
                {customer.preferences && (
                  <div className="flex items-start gap-2.5">
                    <Heart
                      size={16}
                      className="text-pw-text-muted mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-xs text-pw-text-muted">Preferências</p>
                      <p className="text-sm text-pw-text whitespace-pre-line">
                        {customer.preferences}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Histórico de Pedidos */}
          <div className="card">
            <h2 className="text-sm font-semibold text-pw-text mb-4 flex items-center gap-2">
              <ShoppingBag size={16} />
              Histórico de Pedidos
            </h2>
            {customer.orders.length === 0 ? (
              <p className="text-sm text-pw-text-muted py-4 text-center">
                Nenhum pedido registrado para este cliente.
              </p>
            ) : (
              <div className="space-y-2">
                {customer.orders.map((order) => {
                  const statusInfo = statusLabels[order.status] || {
                    label: order.status,
                    color: "text-pw-text-muted",
                  };
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between px-4 py-3 rounded-md bg-pw-bg border border-pw-border/50 hover:border-pw-border transition-colors duration-100 cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/pedidos/${order.id}`)
                      }
                    >
                      <div>
                        <p className="text-sm font-medium text-pw-text">
                          Pedido #{order.orderNumber}
                        </p>
                        <p className="text-xs text-pw-text-muted">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-pw-text">
                          R$ {Number(order.totalAmount).toFixed(2)}
                        </p>
                        <p className={`text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

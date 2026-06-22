"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Factory,
  Package,
  DollarSign,
  Settings,
  LogOut,
  Camera,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Clientes", icon: Users, href: "/dashboard/clientes" },
  { label: "Pedidos", icon: ShoppingBag, href: "/dashboard/pedidos" },
  { label: "Produção", icon: Factory, href: "/dashboard/producao" },
  { label: "Estoque", icon: Package, href: "/dashboard/estoque" },
  { label: "Financeiro", icon: DollarSign, href: "/dashboard/financeiro" },
];

/**
 * Sidebar principal do sistema.
 * Fixa à esquerda com ícones + texto, seguindo o Design System.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] flex flex-col border-r border-pw-border bg-pw-surface z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6 border-b border-pw-border">
        <div className="w-8 h-8 rounded-md bg-pw-accent flex items-center justify-center">
          <Camera size={18} className="text-pw-bg" />
        </div>
        <span className="text-base font-bold text-pw-text tracking-tight">
          Photo Work
        </span>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150
                ${
                  isActive
                    ? "bg-pw-accent/10 text-pw-accent"
                    : "text-pw-text-muted hover:text-pw-text hover:bg-pw-bg"
                }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="px-3 py-4 border-t border-pw-border space-y-1">
        <Link
          href="/dashboard/configuracoes"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-pw-text-muted hover:text-pw-text hover:bg-pw-bg transition-all duration-150"
        >
          <Settings size={18} />
          <span>Configurações</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-pw-text-muted hover:text-pw-danger hover:bg-pw-bg transition-all duration-150 cursor-pointer"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

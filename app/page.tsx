"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Camera, ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/dashboard");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pw-bg">
        <div className="w-6 h-6 border-2 border-pw-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }



  return (
    <main className="min-h-screen bg-pw-bg text-pw-text flex flex-col relative overflow-hidden">
      {/* Navbar Minimalista */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-pw-accent flex items-center justify-center shadow-lg shadow-pw-accent/20">
            <Camera size={22} className="text-pw-bg" />
          </div>
          <span className="text-xl font-bold tracking-tight">Photo Work</span>
        </div>
        <div>
          <button onClick={() => router.push("/sign-in")} className="text-sm font-medium hover:text-pw-accent transition-colors px-4 py-2">
            Entrar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 py-12 z-10">
        
        {/* Lado Esquerdo - Copy e Form */}
        <div className="flex-1 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pw-accent/10 text-pw-accent text-xs font-semibold mb-6 border border-pw-accent/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pw-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pw-accent"></span>
            </span>
            Novo Módulo de Produção Disponível
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400">
            Gestão completa para o seu estúdio fotográfico.
          </h1>

          {/* Imagem Mobile (Entre o título e o texto) */}
          <div className="block lg:hidden w-full relative group perspective-1000 mb-8 mt-2">
            <div className="absolute inset-0 bg-gradient-to-tr from-pw-accent/20 to-transparent blur-3xl opacity-50 rounded-full" />
            <div className="relative rounded-2xl overflow-hidden border border-pw-border/50 shadow-2xl shadow-black/50">
              <Image
                src="/hero_mockup.jpg"
                alt="Photo Work Dashboard Mockup"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pw-bg via-transparent to-transparent opacity-60" />
            </div>
          </div>
          
          <p className="text-lg text-pw-text-muted mb-8 max-w-lg leading-relaxed">
            Abandone as planilhas. Controle pedidos, agenda de produção, estoque e financeiro em uma plataforma premium desenhada para o seu balcão.
          </p>

          {/* Call to Action Button */}
          <button 
            onClick={() => router.push('/sign-up')} 
            className="btn-primary w-full max-w-sm py-3 px-6 text-base flex items-center justify-center gap-2 group shadow-lg shadow-pw-accent/20"
          >
            Começar agora
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-6 mt-6 text-sm text-pw-text-muted">
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-pw-success" /> Sem cartão de crédito</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-pw-success" /> Setup em 2 minutos</div>
          </div>
        </div>

        {/* Lado Direito - Mockup Imagem (Desktop) */}
        <div className="hidden lg:block flex-1 w-full relative group perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-tr from-pw-accent/20 to-transparent blur-3xl opacity-50 rounded-full" />
          <div className="relative rounded-2xl overflow-hidden border border-pw-border/50 shadow-2xl shadow-black/50 transform transition-transform duration-500 hover:rotate-y-[-5deg] hover:rotate-x-[5deg]">
            <Image
              src="/hero_mockup.jpg"
              alt="Photo Work Dashboard Mockup"
              width={800}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
            {/* Overlay gradiente para misturar com o fundo escuro */}
            <div className="absolute inset-0 bg-gradient-to-t from-pw-bg via-transparent to-transparent opacity-60" />
          </div>
        </div>
        
      </div>
    </main>
  );
}

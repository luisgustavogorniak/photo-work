"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Camera, ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");

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

  const validateEmail = (val: string) => {
    // Regex rigoroso para validação de email
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!val) {
      return "O email é obrigatório";
    } else if (!regex.test(val)) {
      return "Formato de email inválido";
    }
    return "";
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    // Supondo que vai redirecionar para o sign-up passando o email na querystring ou localStorage
    // Para simplificar, manda para o sign-up. 
    router.push(`/sign-up?email=${encodeURIComponent(email)}`);
  };

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

          {/* Quick Sign-up Form */}
          <form onSubmit={handleStart} className="w-full max-w-md bg-pw-surface/50 p-4 rounded-xl border border-pw-border backdrop-blur-md">
            <div className="flex flex-col gap-3">
              <div>
                <input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  className={`input-field w-full ${emailError ? 'border-pw-danger focus:border-pw-danger focus:ring-pw-danger/20' : ''}`}
                />
                {emailError && <span className="text-xs text-pw-danger mt-1 block">{emailError}</span>}
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Crie uma senha (qualquer uma por enquanto)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full"
                />
              </div>
              
              <button type="submit" className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 group mt-2">
                Começar agora
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-6 mt-8 text-sm text-pw-text-muted">
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

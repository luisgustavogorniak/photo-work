"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";
import { Camera } from "lucide-react";

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-pw-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-sm px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-pw-accent flex items-center justify-center">
            <Camera size={22} className="text-pw-bg" />
          </div>
          <h1 className="text-2xl font-bold text-pw-text tracking-tight">
            Photo Work
          </h1>
        </div>

        <p className="text-sm text-pw-text-muted mb-8">
          Gestão completa para o seu estúdio de fotografia.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/sign-up")}
            className="btn-primary text-sm"
          >
            Criar Conta
          </button>
          <button
            onClick={() => router.push("/sign-in")}
            className="btn-secondary text-sm"
          >
            Fazer Login
          </button>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/to-do");
    }
  }, [isPending, session, router]);

  if (isPending)
    return (
      <p className="flex items-center justify-center flex-1">
        Aguarde... <Spinner />
      </p>
    );

  return (
    <main className="flex items-center justify-center flex-1">
      <div className="text-center max-w-md px-6">
        <h1 className="text-2xl font-bold mb-2">Gorniakdev Todo</h1>

        <p className="text-base text-[#9ca3af] mb-8">
          Organize suas tarefas de forma simples e eficiente.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.push("/sign-up")}
            className="btn-primary"
          >
            Criar Conta
          </Button>
          <Button
            onClick={() => router.push("/sign-in")}
            className="btn-secondary"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    </main>
  );
}

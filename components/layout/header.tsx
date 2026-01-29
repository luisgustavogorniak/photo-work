"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function Header() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const isLoggedIn = !isPending && session?.user;

  return (
    <header className="border-b">
      <div className=" flex items-center justify-between  py-7 max-w-7xl w-full mx-auto">
        
        <button onClick={() => router.push("/")}>
          <h1 className="text-xl font-bold cursor-pointer">Gorniakdev Todo</h1>

        </button>
        

        <div className="flex gap-2">
          {isLoggedIn ? (
            <Button onClick={() => signOut()} className="btn-primary text-sm">
              Sair
            </Button>
          ) : (
            <>
              <Button
                onClick={() => router.push("/sign-up")}
                className="btn-primary text-sm"
              >
                Criar Conta
              </Button>
              <Button
                onClick={() => router.push("/sign-in")}
                className="btn-secondary text-sm"
              >
                Fazer Login
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

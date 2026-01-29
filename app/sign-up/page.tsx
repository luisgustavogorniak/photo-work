"use client";

import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    const res = await signUp.email({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (res.error) {
      setError(res.error.message || "Something went wrong.");
    } else {
      router.push("/to-do");
    }
  }
  return (
    <main className="max-w-md flex items-center justify-center flex-col flex-1 mx-auto p-6 space-y-4 ">
      <h1 className="text-2xl font-bold">Cadastre-se</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Full Name"
          required
          className="w-full rounded-md border border-neutral-700 px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-md  border border-neutral-700 px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={8}
          className="w-full rounded-md border border-neutral-700 px-3 py-2"
        />
        <Button
          type="submit"
          className="w-full btn-primary font-medium rounded-md px-4 py-2 cursor-pointer"
        >
          Create Account
        </Button>
      </form>
    </main>
  );
}

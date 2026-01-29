"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { createTodo, getTodos } from "../actions/todo.actions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function TodoPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  type Todo = {
    id: string;
    content: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
  };

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loadingTodos, setLoadingTodos] = useState(true);

  useEffect(() => {
    getTodos().then((result) => {
      setTodos(result);
      setLoadingTodos(false);
    });
  }, []);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending)
    return (
      <p className="flex items-center justify-center flex-1">
        Aguarde... <Spinner />
      </p>
    );

  const handleCreateTodo = async (formData: FormData) => {
    await createTodo(formData);
    const updatedTodos = await getTodos();
    setTodos(updatedTodos);
  };

  return (
    <main className="flex flex-col flex-1 p-5 space-y-5">
      <h1 className="text-2xl font-bold">Lista de Afazeres...</h1>
      <form action={handleCreateTodo} className="flex">
        <Input
          name="content"
          className="max-w-100"
          placeholder="O que precisa ser feito?"
        />
        <Button className="ml-2 btn-primary">Adicionar</Button>
      </form>

      {loadingTodos ? (
        <p>Carregando tarefas...</p>
      ) : todos.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma tarefa ainda...</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id}>
              <Card className="mx-auto p-4">
                {" "}
                <CardContent>{todo.content}</CardContent>
                <CardFooter className="flex justify-between p-3">
                  <div className="flex gap-2">
                    <Button className="btn-primary">Editar</Button>
                    <Button className="btn-danger">Deletar</Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm">Completado</p>
                    <Checkbox
                      className="h-8 w-8 data-[state=checked]:bg-green-500"
                      id="terms-checkbox-basic"
                      name="terms-checkbox-basic"
                    />
                  </div>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

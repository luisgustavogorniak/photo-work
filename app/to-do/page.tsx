"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { createTodo, getTodos, deleteTodo, updateTodo, toggleTodoCompleted } from "../actions/todo.actions";
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
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState("");
  const [operationLoading, setOperationLoading] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<string>("");

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
    try {
      setError("");
      await createTodo(formData);
      const updatedTodos = await getTodos();
      setTodos(updatedTodos);
    } catch (err) {
      setError("Erro ao criar tarefa. Tente novamente.");
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      setError("");
      setOperationLoading(prev => ({ ...prev, [todoId]: true }));
      await deleteTodo(todoId);
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    } catch (err) {
      setError("Erro ao deletar tarefa. Tente novamente.");
    } finally {
      setOperationLoading(prev => ({ ...prev, [todoId]: false }));
    }
  };

  const handleOpenEditModal = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditContent(todo.content);
  };

  const handleCloseEditModal = () => {
    setEditingTodoId(null);
    setEditContent("");
    setEditError("");
  };

  const handleSaveEdit = async () => {
    if (!editingTodoId) return;

    if (!editContent.trim()) {
      setEditError("O campo não pode estar vazio");
      return;
    }

    try {
      setError("");
      setOperationLoading(prev => ({ ...prev, [editingTodoId]: true }));
      await updateTodo(editingTodoId, editContent);
      const updatedTodos = await getTodos();
      setTodos(updatedTodos);
      handleCloseEditModal();
    } catch (err) {
      setError("Erro ao atualizar tarefa. Tente novamente.");
    } finally {
      setOperationLoading(prev => ({ ...prev, [editingTodoId]: false }));
    }
  };

  const handleToggleCompleted = async (todo: Todo) => {
    try {
      setError("");
      setOperationLoading(prev => ({ ...prev, [todo.id]: true }));
      await toggleTodoCompleted(todo.id, !todo.completed);
      const updatedTodos = await getTodos();
      setTodos(updatedTodos);
    } catch (err) {
      setError("Erro ao atualizar tarefa. Tente novamente.");
    } finally {
      setOperationLoading(prev => ({ ...prev, [todo.id]: false }));
    }
  };

  return (
    <main className="flex flex-col flex-1 p-5 space-y-5">
      <h1 className="text-2xl font-bold">Lista de Afazeres...</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
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
                    <Button 
                      className="btn-primary"
                      onClick={() => handleOpenEditModal(todo)}
                      disabled={operationLoading[todo.id]}
                    >
                      Editar
                    </Button>
                    <Button 
                      className="btn-danger"
                      onClick={() => handleDeleteTodo(todo.id)}
                      disabled={operationLoading[todo.id]}
                    >
                      {operationLoading[todo.id] ? <Spinner /> : "Deletar"}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm">Completado</p>
                    {operationLoading[todo.id] ? (
                      <Spinner />
                    ) : (
                      <Checkbox
                        className="h-8 w-8 data-[state=checked]:bg-green-500"
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleCompleted(todo)}
                      />
                    )}
                  </div>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {editingTodoId && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleCloseEditModal}>
          <Card className="w-96 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold">Editar Tarefa</h2>
            <Input
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value);
                setEditError("");
              }}
              placeholder="Edite a tarefa..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") handleCloseEditModal();
              }}
              autoFocus
            />
            {editError && (
              <p className="text-red-500 text-sm">{editError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                className="btn-secondary"
                onClick={handleCloseEditModal}
                disabled={operationLoading[editingTodoId || ""]}
              >
                Cancelar
              </Button>
              <Button
                className="btn-primary"
                onClick={handleSaveEdit}
                disabled={operationLoading[editingTodoId || ""]}
              >
                {operationLoading[editingTodoId || ""] ? <Spinner /> : "Salvar"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}

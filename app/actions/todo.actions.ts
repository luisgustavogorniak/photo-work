"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function getTodos() {
    const session = await auth.api.getSession(
        {
            headers: await headers(),
        }
    );

    if (!session?.user?.id) {
        return [];
    }

    const todos = await prisma.todo.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return todos;
}

export async function createTodo(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user?.id) return

    const content = formData.get("content")?.toString().trim()

    if (!content) return

    await prisma.todo.create({
        data: {
            content,
            userId: session.user.id,
        },
    })

    revalidatePath("/to-do")
}



export async function deleteTodo(todoId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user?.id) return

    await prisma.todo.delete({
        where: {
            id: todoId,
            userId: session.user.id,
        },
    })

    revalidatePath("/to-do")
}

export async function updateTodo(todoId: string, content: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user?.id) return

    const trimmedContent = content.trim()
    if (!trimmedContent) return

    await prisma.todo.update({
        where: {
            id: todoId,
            userId: session.user.id,
        },
        data: {
            content: trimmedContent,
        },
    })

    revalidatePath("/to-do")
}

export async function toggleTodoCompleted(todoId: string, completed: boolean) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user?.id) return

    await prisma.todo.update({
        where: {
            id: todoId,
            userId: session.user.id,
        },
        data: {
            completed,
        },
    })

    revalidatePath("/to-do")
}
import { TodoApp } from "@/components/todos/todo-app";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 py-14 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto w-full max-w-3xl px-4">
        <TodoApp />
      </main>
    </div>
  );
}

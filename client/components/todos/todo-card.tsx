"use client";
import { Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Todo } from "@/types/todo";

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

export function TodoCard({ todo, onToggle, onEdit, onDelete }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(todo._id)}
          className="mt-1 grid h-6 w-6 place-items-center rounded-full border border-zinc-300 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {todo.done ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <div className="h-3 w-3 rounded-full border-2 border-zinc-400" />
          )}
        </button>
        <div className="flex-1">
          <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {todo.title}
          </h4>
          {todo.description ? (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{todo.description}</p>
          ) : null}
          <div className="mt-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button size="sm" variant="outline" onClick={() => onEdit(todo)}>
              <Pencil className="mr-2 h-3 w-3" /> Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(todo._id)}>
              <Trash2 className="mr-2 h-3 w-3" /> Delete
            </Button>
          </div>
        </div>
      </div>
      {todo.done && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-green-500 via-emerald-500 to-teal-500" />
      )}
    </div>
  );
}

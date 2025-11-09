"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Todo } from "@/types/todo";
import { TodoCard } from "./todo-card";
const API_BASE = "http://localhost:5000";
async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const body = await res.json().catch(() => ({}));
      throw Object.assign(new Error(body?.message || JSON.stringify(body) || `Request failed ${res.status}`), { status: res.status });
    }
    const text = await res.text().catch(() => "");
    throw Object.assign(new Error(text || `Request failed ${res.status}`), { status: res.status });
  }
  // Handle no-content responses (e.g., DELETE 204)
  if (res.status === 204) return undefined as unknown as T;
  const len = res.headers.get("content-length");
  if (len === "0" || len === null) {
    // Try to detect empty body when content-length missing
    const text = await res.text().catch(() => "");
    if (!text) return undefined as unknown as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return undefined as unknown as T;
    }
  }
  return (await res.json()) as T;
}
const errMsg = (e: any) => e?.message || "Request failed";
const TITLE_MAX = 100;

type Draft = {
  title: string;
  description: string;
};

type Props = { initialTodos?: Todo[] };

export function TodoApp({ initialTodos = [] }: Props) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [draft, setDraft] = useState<Draft>({ title: "", description: "" });
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(initialTodos.length === 0);
  const [formError, setFormError] = useState<string | null>(null);
  const titleLen = draft.title.length;
  const titleInvalid = titleLen === 0 || titleLen > TITLE_MAX;

  const isTempId = (id: string) => id.startsWith("tmp_");
  const isNumericId = (id: string) => Number.isInteger(Number(id));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (initialTodos.length > 0) return; // already hydrated from SSR
      setInitialLoading(true);
      setErrorMsg(null);
      try {
        const data = await req<Todo[]>("/api/todos", { method: "GET" });
        if (!cancelled) setTodos(data);
      } catch (e: any) {
        if (!cancelled) setErrorMsg(errMsg(e));
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [initialTodos.length]);

  const filtered = useMemo(() => {
    if (filter === "done") return todos.filter((t) => t.done);
    if (filter === "open") return todos.filter((t) => !t.done);
    return todos;
  }, [todos, filter]);

  function handleAddClick() {
    setEditing(null);
    setDraft({ title: "", description: "" });
    setFormError(null);
    setOpen(true);
  }

  function handleEdit(todo: Todo) {
    setEditing(todo);
    setDraft({ title: todo.title, description: todo.description ?? "" });
    setFormError(null);
    setOpen(true);
  }

  async function saveDraft() {
    if (pending) return;
    if (!draft.title.trim()) {
      setFormError("Title is required");
      return;
    }
    if (draft.title.length > TITLE_MAX) {
      setFormError(`Title must be at most ${TITLE_MAX} characters`);
      return;
    }
    setErrorMsg(null);
    setFormError(null);
    if (editing) {
      if (!isNumericId(editing._id)) {
        setErrorMsg("Cannot edit an unsaved todo. Please try again.");
        return;
      }
      const prev = todos;
      const optimistic = prev.map((t) =>
        t._id === editing._id
          ? { ...t, title: draft.title.trim(), description: draft.description.trim() || undefined, updatedAt: new Date().toISOString() }
          : t
      );
      setTodos(optimistic);
      setPending(true);
      try {
        const updated = await req<Todo>(`/api/todos/${editing._id}`, { method: "PATCH", body: JSON.stringify({
          title: draft.title.trim(),
          description: draft.description.trim() || undefined,
        }) });
        setTodos((curr) => curr.map((t) => (t._id === updated._id ? updated : t)));
        setOpen(false);
      } catch (e: any) {
        setTodos(prev);
        setErrorMsg(errMsg(e));
        setFormError(errMsg(e));
      } finally {
        setPending(false);
      }
    } else {
      const now = new Date().toISOString();
      const tempId = `tmp_${now}`;
      const optimistic: Todo = {
        _id: tempId,
        title: draft.title.trim(),
        description: draft.description.trim() || undefined,
        done: false,
        createdAt: now,
        updatedAt: now,
      };
      setTodos((prev) => [optimistic, ...prev]);
      setPending(true);
      try {
        const created = await req<Todo>(`/api/todos`, { method: "POST", body: JSON.stringify({ title: optimistic.title, description: optimistic.description }) });
        setTodos((curr) => curr.map((t) => (t._id === tempId ? created : t)));
        setOpen(false);
      } catch (e: any) {
        setTodos((curr) => curr.filter((t) => t._id !== tempId));
        setErrorMsg(errMsg(e));
        setFormError(errMsg(e));
      } finally {
        setPending(false);
      }
    }
  }

  async function toggleDone(id: string) {
    if (pending) return;
    if (isTempId(id) || !isNumericId(id)) return; // ignore toggles on unsaved items
    setErrorMsg(null);
    const prev = todos;
    let nextDone = false;
    setTodos((curr) => curr.map((t) => {
      if (t._id === id) {
        nextDone = !t.done;
        return { ...t, done: nextDone, updatedAt: new Date().toISOString() };
      }
      return t;
    }));
    setPending(true);
    try {
      // Try dedicated done route first, fallback to PATCH with body
      let updated: Todo;
      try {
        updated = await req<Todo>(`/api/todos/${id}/done`, { method: "PATCH" });
      } catch (err: any) {
        if (err?.status === 404) {
          updated = await req<Todo>(`/api/todos/${id}`, { method: "PATCH", body: JSON.stringify({ done: nextDone }) });
        } else {
          throw err;
        }
      }
      setTodos((curr) => curr.map((t) => (t._id === id ? updated : t)));
    } catch (e: any) {
      setTodos(prev);
      if (e?.status === 404) {
        try {
          const data = await req<Todo[]>("/api/todos", { method: "GET" });
          setTodos(data);
        } catch {}
      }
      setErrorMsg(errMsg(e));
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    if (pending) return;
    setErrorMsg(null);
    const prev = todos;
    setTodos((curr) => curr.filter((t) => t._id !== id));
    setPending(true);
    try {
      if (!isTempId(id) && isNumericId(id)) {
        await req<void>(`/api/todos/${id}`, { method: "DELETE" });
      }
    } catch (e: any) {
      setTodos(prev);
      setErrorMsg(errMsg(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <header className="mb-8 flex items-center justify-between animate-in slide-in-from-top-2 fade-in duration-300 ease-out will-change-transform will-change-opacity">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Todos</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-full bg-zinc-100 p-1 text-xs dark:bg-zinc-900 sm:flex">
            <button onClick={() => setFilter("all")} className={`rounded-full px-3 py-1 transition-base hover:bg-white/80 dark:hover:bg-zinc-800/80 ${filter === "all" ? "bg-white shadow dark:bg-zinc-800" : ""}`}>All</button>
            <button onClick={() => setFilter("open")} className={`rounded-full px-3 py-1 transition-base hover:bg-white/80 dark:hover:bg-zinc-800/80 ${filter === "open" ? "bg-white shadow dark:bg-zinc-800" : ""}`}>Open</button>
            <button onClick={() => setFilter("done")} className={`rounded-full px-3 py-1 transition-base hover:bg-white/80 dark:hover:bg-zinc-800/80 ${filter === "done" ? "bg-white shadow dark:bg-zinc-800" : ""}`}>Done</button>
          </div>
          <Button onClick={handleAddClick} size="lg" disabled={pending}>
            <Plus className="mr-2 h-4 w-4" /> Add Todo
          </Button>
        </div>
      </header>

      {errorMsg ? (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {errorMsg}
        </div>
      ) : null}

      <section className="grid gap-3">
        {initialLoading ? (
          <div className="grid gap-2">
            <div className="h-16 animate-pulse rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60" />
            <div className="h-16 animate-pulse rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60" />
            <div className="h-16 animate-pulse rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-xl border border-dashed border-zinc-300 p-12 text-sm text-zinc-500 animate-in pop-in fade-in ease-out duration-300 dark:border-zinc-800 dark:text-zinc-400">
            No todos yet. Click "Add Todo" to create one.
          </div>
        ) : (
          filtered.map((todo, idx) => (
            <div
              key={todo._id}
              className="animate-in slide-in-from-bottom-2 fade-in duration-300 ease-out will-change-transform will-change-opacity"
              style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
            >
              <TodoCard todo={todo} onToggle={toggleDone} onEdit={handleEdit} onDelete={remove} />
            </div>
          ))
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Todo" : "Add Todo"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-700 dark:text-zinc-300">Title</label>
              <span className={`text-xs ${titleLen > TITLE_MAX ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"}`}>{titleLen}/{TITLE_MAX}</span>
            </div>
            <Input
              placeholder="e.g. Ship the MVP"
              value={draft.title}
              onChange={(e) => { setDraft((d) => ({ ...d, title: e.target.value })); if (formError) setFormError(null); }}
              aria-invalid={titleInvalid || !!formError}
              maxLength={TITLE_MAX + 50}
              className={`${(titleInvalid || formError) ? "border-red-400 focus-visible:ring-red-500 dark:border-red-700 dark:focus-visible:ring-red-300" : ""}`}
            />
          </div>
          {formError ? (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
              {formError}
            </div>
          ) : null}
          <div className="space-y-1">
            <label className="text-sm text-zinc-700 dark:text-zinc-300">Description</label>
            <textarea
              className="min-h-[96px] w-full rounded-md border border-zinc-300 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus-visible:ring-zinc-200"
              placeholder="Optional details"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
          <Button onClick={saveDraft} disabled={pending || !draft.title.trim()}>{pending ? "Saving..." : editing ? "Save" : "Create"}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

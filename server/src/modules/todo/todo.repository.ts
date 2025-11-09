import { Todo } from '../../types';
import { randomUUID } from 'crypto';

const store: Todo[] = [];

export const todoRepository = {
  list(): Todo[] {
    return [...store];
  },

  getById(id: string): Todo | undefined {
    return store.find(t => t._id === id);
  },

  create(data: { title: string; done: boolean; description?: string }): Todo {
    const now = new Date().toISOString();
    const todo: Todo = {
      _id: randomUUID(),
      title: data.title,
      description: data.description,
      done: data.done,
      createdAt: now,
      updatedAt: now,
    };
    store.unshift(todo);
    return todo;
  },

  update(id: string, data: Partial<Pick<Todo, 'title' | 'done' | 'description'>>): Todo | undefined {
    const idx = store.findIndex(t => t._id === id);
    if (idx === -1) return undefined;
    const updated: Todo = { ...store[idx], ...data, updatedAt: new Date().toISOString() };
    store[idx] = updated;
    return updated;
  },

  remove(id: string): boolean {
    const idx = store.findIndex(t => t._id === id);
    if (idx === -1) return false;
    store.splice(idx, 1);
    return true;
  },
};


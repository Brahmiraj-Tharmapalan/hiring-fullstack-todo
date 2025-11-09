import { Todo } from '../../types';
import { prisma } from '../../config/prisma';
import { conflict } from '../../utils/ApiError';

function toTodo(row: any): Todo {
  return {
    _id: String(row.id),
    title: row.title,
    description: row.description ?? undefined,
    done: !!row.done,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

export const todoRepository = {
  async list(): Promise<Todo[]> {
    const rows = await prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(toTodo);
  },

  async getById(id: string): Promise<Todo | undefined> {
    const intId = Number(id);
    if (!Number.isInteger(intId)) return undefined;
    const row = await prisma.todo.findUnique({ where: { id: intId } });
    return row ? toTodo(row) : undefined;
  },

  async create(data: { title: string; done: boolean; description?: string }): Promise<Todo> {
    try {
      const row = await prisma.todo.create({
        data: {
          title: data.title,
          description: data.description,
          done: data.done,
        },
      });
      return toTodo(row);
    } catch (e: any) {
      if (e?.code === 'P2002' && Array.isArray(e?.meta?.target) && e.meta.target.includes('title')) {
        throw conflict('A todo with this title already exists');
      }
      throw e;
    }
  },

  async update(id: string, data: Partial<Pick<Todo, 'title' | 'done' | 'description'>>): Promise<Todo | undefined> {
    const intId = Number(id);
    if (!Number.isInteger(intId)) return undefined;
    try {
      const row = await prisma.todo.update({ where: { id: intId }, data });
      return toTodo(row);
    } catch {
      return undefined;
    }
  },

  async remove(id: string): Promise<boolean> {
    const intId = Number(id);
    if (!Number.isInteger(intId)) return false;
    try {
      await prisma.todo.delete({ where: { id: intId } });
      return true;
    } catch {
      return false;
    }
  },
};


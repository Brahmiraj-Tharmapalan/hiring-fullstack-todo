import { todoRepository } from './todo.repository';
import { CreateTodoInput, UpdateTodoInput } from '../../schemas/todo.schema';
import { Todo } from '../../types';
import { notFound } from '../../utils/ApiError';

export const todoService = {
  async list(): Promise<Todo[]> {
    return await todoRepository.list();
  },

  async get(id: string): Promise<Todo> {
    const found = await todoRepository.getById(id);
    if (!found) throw notFound('Todo not found');
    return found;
  },

  async create(input: CreateTodoInput): Promise<Todo> {
    return await todoRepository.create({
      title: input.title,
      done: input.done ?? false,
      description: input.description,
    });
  },

  async update(id: string, input: UpdateTodoInput): Promise<Todo> {
    const updated = await todoRepository.update(id, input);
    if (!updated) throw notFound('Todo not found');
    return updated;
  },

  async updateTitleDescription(id: string, input: { title?: string; description?: string }): Promise<Todo> {
    const payload: { title?: string; description?: string } = {};
    if (typeof input.title !== 'undefined') payload.title = input.title;
    if (typeof input.description !== 'undefined') payload.description = input.description;
    const updated = await todoRepository.update(id, payload);
    if (!updated) throw notFound('Todo not found');
    return updated;
  },

  async toggleDone(id: string): Promise<Todo> {
    const current = await todoRepository.getById(id);
    if (!current) throw notFound('Todo not found');
    const updated = await todoRepository.update(id, { done: !current.done });
    if (!updated) throw notFound('Todo not found');
    return updated;
  },

  async remove(id: string): Promise<void> {
    const ok = await todoRepository.remove(id);
    if (!ok) throw notFound('Todo not found');
  },
};


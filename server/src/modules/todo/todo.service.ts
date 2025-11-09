import { todoRepository } from './todo.repository';
import { CreateTodoInput, UpdateTodoInput } from '../../schemas/todo.schema';
import { Todo } from '../../types';
import { notFound } from '../../utils/ApiError';

export const todoService = {
  list(): Todo[] {
    return todoRepository.list();
  },

  get(id: string): Todo {
    const found = todoRepository.getById(id);
    if (!found) throw notFound('Todo not found');
    return found;
  },

  create(input: CreateTodoInput): Todo {
    return todoRepository.create({
      title: input.title,
      done: input.done ?? false,
      description: input.description,
    });
  },

  update(id: string, input: UpdateTodoInput): Todo {
    const updated = todoRepository.update(id, input);
    if (!updated) throw notFound('Todo not found');
    return updated;
  },

  updateTitleDescription(id: string, input: { title?: string; description?: string }): Todo {
    const payload: { title?: string; description?: string } = {};
    if (typeof input.title !== 'undefined') payload.title = input.title;
    if (typeof input.description !== 'undefined') payload.description = input.description;
    const updated = todoRepository.update(id, payload);
    if (!updated) throw notFound('Todo not found');
    return updated;
  },

  toggleDone(id: string): Todo {
    const current = todoRepository.getById(id);
    if (!current) throw notFound('Todo not found');
    const updated = todoRepository.update(id, { done: !current.done });
    if (!updated) throw notFound('Todo not found');
    return updated;
  },

  remove(id: string): void {
    const ok = todoRepository.remove(id);
    if (!ok) throw notFound('Todo not found');
  },
};


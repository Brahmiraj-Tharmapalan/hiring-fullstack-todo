import { Request, Response, NextFunction } from 'express';
import { todoService } from './todo.service';

export const listTodos = (_req: Request, res: Response) => {
  const todos = todoService.list();
  res.json(todos);
};

export const getTodo = (req: Request, res: Response) => {
  const todo = todoService.get(req.params.id);
  res.json(todo);
};

export const createTodo = (req: Request, res: Response, next: NextFunction) => {
  try {
    const todo = todoService.create(req.body);
    res.status(201).json(todo);
  } catch (e) {
    next(e);
  }
};

export const updateTodo = (req: Request, res: Response, next: NextFunction) => {
  try {
    const todo = todoService.update(req.params.id, req.body);
    res.json(todo);
  } catch (e) {
    next(e);
  }
};

export const deleteTodo = (req: Request, res: Response, next: NextFunction) => {
  try {
    todoService.remove(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

export const putUpdateTodo = (req: Request, res: Response, next: NextFunction) => {
  try {
    const todo = todoService.updateTitleDescription(req.params.id, req.body);
    res.json(todo);
  } catch (e) {
    next(e);
  }
};

export const toggleDone = (req: Request, res: Response, next: NextFunction) => {
  try {
    const todo = todoService.toggleDone(req.params.id);
    res.json(todo);
  } catch (e) {
    next(e);
  }
};


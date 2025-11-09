import { Request, Response, NextFunction } from 'express';
import { todoService } from './todo.service';

export const listTodos = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const todos = await todoService.list();
    res.json(todos);
  } catch (e) { next(e); }
};

export const getTodo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todo = await todoService.get(req.params.id);
    res.json(todo);
  } catch (e) { next(e); }
};

export const createTodo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todo = await todoService.create(req.body);
    res.status(201).json(todo);
  } catch (e) { next(e); }
};

export const updateTodo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todo = await todoService.update(req.params.id, req.body);
    res.json(todo);
  } catch (e) { next(e); }
};

export const deleteTodo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await todoService.remove(req.params.id);
    res.status(204).send();
  } catch (e) { next(e); }
};

export const putUpdateTodo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todo = await todoService.updateTitleDescription(req.params.id, req.body);
    res.json(todo);
  } catch (e) { next(e); }
};

export const toggleDone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todo = await todoService.toggleDone(req.params.id);
    res.json(todo);
  } catch (e) { next(e); }
};


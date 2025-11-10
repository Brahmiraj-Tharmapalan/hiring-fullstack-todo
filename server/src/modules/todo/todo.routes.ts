import { Router } from 'express';
import { createTodo, deleteTodo, getTodo, listTodos, updateTodo, putUpdateTodo, toggleDone } from './todo.controller';
import { validate } from '../../middleware/validateRequest';
import { createTodoSchema, paramsSchema, updateTodoSchema, putTodoSchema } from '../../schemas/todo.schema';

const router = Router();

router.get('/', listTodos);
router.get('/:id', validate({ params: paramsSchema }), getTodo);
router.post('/', validate({ body: createTodoSchema }), createTodo);
router.patch('/:id', validate({ params: paramsSchema, body: updateTodoSchema }), updateTodo);
router.delete('/:id', validate({ params: paramsSchema }), deleteTodo);
router.put('/:id', validate({ params: paramsSchema, body: putTodoSchema }), putUpdateTodo);
router.patch('/:id/done', validate({ params: paramsSchema }), toggleDone);

export default router;


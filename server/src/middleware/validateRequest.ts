import { ZodError, ZodTypeAny } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { badRequest } from '../utils/ApiError';

type Schema = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export const validate = (schema: Schema) => async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (schema.body) req.body = schema.body.parse(req.body);
    if (schema.params) req.params = schema.params.parse(req.params);
    if (schema.query) req.query = schema.query.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return next(badRequest('Validation failed', err.flatten()));
    }
    next(err);
  }
};


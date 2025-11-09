export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, ApiError);
  }
}

export const notFound = (message = 'Resource not found') => new ApiError(404, message);
export const badRequest = (message = 'Bad request', details?: unknown) => new ApiError(400, message, details);
export const unauthorized = (message = 'Unauthorized') => new ApiError(401, message);
export const forbidden = (message = 'Forbidden') => new ApiError(403, message);
export const conflict = (message = 'Conflict') => new ApiError(409, message);
export const internal = (message = 'Internal server error', details?: unknown) => new ApiError(500, message, details);

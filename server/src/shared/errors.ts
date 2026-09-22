export class AppError extends Error {
  constructor(public readonly statusCode: number, public readonly code: string, message: string, public readonly details: unknown = {}) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (message: string, details?: unknown) => new AppError(400, 'BAD_REQUEST', message, details);
export const unauthorized = (message = '需要登录') => new AppError(401, 'UNAUTHORIZED', message);
export const forbidden = (message = '无权访问该资源') => new AppError(403, 'FORBIDDEN', message);
export const notFound = (message = '资源不存在') => new AppError(404, 'NOT_FOUND', message);
export const conflict = (message: string, details?: unknown) => new AppError(409, 'CONFLICT', message, details);
export const validationError = (details: unknown) => new AppError(422, 'VALIDATION_ERROR', '请求参数校验失败', details);

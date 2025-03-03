import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    errors: err.errors || null
  });
};

export class ApiError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, errors?: any[]) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(404, message);
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(500, message);
  }
} 
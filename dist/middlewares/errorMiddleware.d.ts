import { Request, Response, NextFunction } from 'express';
interface CustomError extends Error {
    statusCode?: number;
    errors?: any[];
}
export declare const errorHandler: (err: CustomError, req: Request, res: Response, next: NextFunction) => void;
export declare class ApiError extends Error {
    statusCode: number;
    errors?: any[];
    constructor(statusCode: number, message: string, errors?: any[]);
    static badRequest(message: string, errors?: any[]): ApiError;
    static unauthorized(message?: string): ApiError;
    static forbidden(message?: string): ApiError;
    static notFound(message?: string): ApiError;
    static internal(message?: string): ApiError;
}
export {};

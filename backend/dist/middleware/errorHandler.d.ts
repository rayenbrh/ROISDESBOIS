import { Request, Response, NextFunction } from 'express';
/**
 * Global error handler middleware
 */
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
/**
 * 404 Not Found handler
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
//# sourceMappingURL=errorHandler.d.ts.map
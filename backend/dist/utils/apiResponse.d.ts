import { Response } from 'express';
export declare const sendSuccess: <T>(res: Response, data: T, statusCode?: number, meta?: any) => Response;
export declare const sendError: (res: Response, message: string, statusCode?: number, code?: string, details?: any) => Response;
export declare const sendPaginated: <T>(res: Response, data: T[], page: number, limit: number, total: number) => Response;
//# sourceMappingURL=apiResponse.d.ts.map
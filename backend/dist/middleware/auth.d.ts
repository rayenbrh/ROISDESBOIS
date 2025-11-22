import { Request, Response, NextFunction } from 'express';
import { UserRole, AuthTokenPayload } from '../types';
declare global {
    namespace Express {
        interface Request {
            user?: AuthTokenPayload & {
                _id: string;
            };
        }
    }
}
/**
 * Verify JWT token and attach user to request
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Check if user has required role(s)
 */
export declare const authorize: (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Admin only middleware
 */
export declare const adminOnly: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Admin or Commercial middleware
 */
export declare const adminOrCommercial: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map
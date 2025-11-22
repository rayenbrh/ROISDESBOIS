import { AuthTokenPayload } from '../types';
export declare const generateAccessToken: (payload: AuthTokenPayload) => string;
export declare const generateRefreshToken: (payload: AuthTokenPayload) => string;
export declare const verifyAccessToken: (token: string) => AuthTokenPayload;
export declare const verifyRefreshToken: (token: string) => AuthTokenPayload;
//# sourceMappingURL=jwt.d.ts.map
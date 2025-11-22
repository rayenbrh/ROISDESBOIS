import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../types';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export const generateAccessToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
};

export const generateRefreshToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as AuthTokenPayload;
};

export const verifyRefreshToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as AuthTokenPayload;
};

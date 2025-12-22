import { Request } from 'express';

/**
 * Extracts JWT token from request headers or cookies
 * @param req Express request object
 * @returns JWT token string or undefined
 */
export function extractTokenFromRequest(req: Request): string | undefined {
  return (req.headers.jwt as string) ?? req.cookies?.['jwt'];
}


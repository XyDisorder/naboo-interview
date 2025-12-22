export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
}

/**
 * Creates secure cookie options for JWT tokens
 * @returns CookieOptions configured for the current environment
 */
export function createCookieOptions(): CookieOptions {
  const options: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  // Only set domain in production (cookies work better without domain on localhost)
  if (process.env.FRONTEND_DOMAIN) {
    options.domain = process.env.FRONTEND_DOMAIN;
  }

  return options;
}


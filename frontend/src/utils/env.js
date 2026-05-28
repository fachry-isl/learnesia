/** Browser and client-side requests (host-visible URL). */
export const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Server-side requests (e.g. generateMetadata).
 * Use API_URL in Docker: http://backend:8000/api
 */
export const PRIVATE_API_BASE_URL = process.env.API_URL || PUBLIC_API_BASE_URL;

export const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';

/** Empty fallback forces redirect if env is not set. */
export const ADMIN_SECRET_KEY = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || '';

export const PERPLEXICA_API_URL =
  process.env.NEXT_PUBLIC_PERPLEXICA_URL || 'http://100.122.67.1:3000';

// utils/getBaseUrl.js
export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Client-side detection
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${hostname}${port}`;
  } else {
    // Server-side detection (Next.js server or API routes)
    const protocol = process.env.VERCEL_URL
      ? 'https:' // For Vercel deployments, force HTTPS
      : process.env.NODE_ENV === 'production'
      ? 'https:' // Default to HTTPS in production
      : 'http:'; // Default to HTTP for local development

    const hostname = process.env.VERCEL_URL || process.env.HOSTNAME || 'localhost';
    const port = process.env.PORT ? `:${process.env.PORT}` : '';
    return `${protocol}//${hostname}${port}`;
  }
}
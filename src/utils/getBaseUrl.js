// utils/getBaseUrl.js
export function getBaseUrl() {
    // Check if we're running on the client side
    if (typeof window !== 'undefined') {
      // Client-side detection
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      // return `${protocol}//${hostname}${port}`;
      return "https://localhost:8443";
    } else {
      // Server-side detection (Next.js server or API routes)
      // Note: In server-side context, you may not always have access to `req` directly,
      // especially outside of request handlers, so this approach may vary based on context.
      const protocol = process.env.VERCEL_URL
        ? 'https:' // For Vercel deployments, force HTTPS
        : 'http:'; // Default to HTTP for local development or non-Vercel servers
  
      const hostname = process.env.VERCEL_URL || 'localhost';
      const port = process.env.PORT ? `:${process.env.PORT}` : '';
      // return `${protocol}//${hostname}${port}`;
      return "https://localhost:8443";
    }
  }
  
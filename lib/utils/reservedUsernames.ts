/**
 * List of usernames that are reserved by the platform 
 * and cannot be claimed by users to avoid route conflicts
 * or impersonation of official accounts.
 */
export const RESERVED_USERNAMES = new Set([
  // Core App Routes
  "api",
  "auth",
  "editor",
  "login",
  "signup",
  "signin",
  "logout",
  "forgot-password",
  "reset-password",
  
  // Legal & Info
  "pagecraft",
  "privacy-policy",
  "terms",
  "cookie-policy",
  "sitemap",
  "robots",
  "about",
  "contact",
  "help",
  "support",
  "faq",
  
  // Internal/Admin
  "admin",
  "administrator",
  "root",
  "pagecraft",
  "team",
  "staff",
  "mod",
  "moderator",
  "system",
  
  // Potential Future Features
  "blog",
  "pricing",
  "dashboard",
  "settings",
  "analytics",
  "profile",
  "user",
  "account",
  "billing",
  "dev",
  "developer",
  "docs",
  "status",
  "jobs",
  "news",
  "updates",

  // Common Squatters
  "home",
  "index",
  "null",
  "undefined",
  "test",
  "demo",
  "example",
  "placeholder",

  // Social/wellknown
  "well-known",
  "feed",
  "rss",

  // Web / Infra
  "favicon.ico",
  "manifest.json",
  "sw.js",
  "service-worker",
  "assets",
  "static",
  "public",
  "uploads",
  "cdn",
  "files",
  "images",
  "img",
  "css",
  "js",
  "fonts",

  // Security
  "security",
  "security.txt",
]);

/**
 * Checks if a given username is on the reserved list.
 */
export function isReservedUsername(username: string): boolean {
  if (!username) return false;
  return RESERVED_USERNAMES.has(username.toLowerCase().trim());
}

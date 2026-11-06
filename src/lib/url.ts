/** Prefix internal links with the configured base path (needed for GitHub Pages sub-paths). */
export function href(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

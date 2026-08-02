export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL;
  const normalized = path.replace(/^\/+/, '');
  return `${base}${normalized}`;
}

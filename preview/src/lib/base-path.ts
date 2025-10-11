const resolveBaseUrl = () => {
  const metaEnv = (import.meta as unknown as { env?: { BASE_URL?: string } }).env;
  return metaEnv?.BASE_URL ?? process.env.VITE_BASE_PATH ?? '/';
};

const baseUrl = resolveBaseUrl();

export function withBasePath(target: string) {
  if (/^https?:\/\//.test(target)) return target;
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const normalizedTarget = target.replace(/^\/+/, '');
  return `${normalizedBase}${normalizedTarget}`;
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function getUrl(baseUrl?: string) {
  return (baseUrl || getBaseUrl()) + "/api/trpc";
}

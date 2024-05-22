export function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export function getUrl(baseUrl?: string) {
  return (baseUrl ?? getBaseUrl()) + "/api/trpc";
}

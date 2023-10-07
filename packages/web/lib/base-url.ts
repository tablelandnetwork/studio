export function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.SITE_DOMAIN) {
    return `https://${process.env.SITE_DOMAIN}`;
  }
  return "http://localhost:3000";
}

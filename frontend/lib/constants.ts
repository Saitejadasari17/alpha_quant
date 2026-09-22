export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    if (port === "3000") {
      return `${protocol}//${hostname}:8000`;
    }
    return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  }
  return "http://localhost:8000";
};

export const API_BASE_URL = getApiBaseUrl();
export const AUTH_TOKEN_KEY = "fwp_auth_token";

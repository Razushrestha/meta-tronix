const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export type User = { id: string; name: string; email: string; role: string };

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (t: string | null) => (accessToken = t);

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    // Abort the request if the server doesn't answer in time,
    // so the auth "loading" state can never hang forever.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    refreshPromise = fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("refresh failed");
        const data = await res.json();
        accessToken = data.accessToken;
        return accessToken;
      })
      .catch(() => {
        accessToken = null;
        return null;
      })
      .finally(() => {
        clearTimeout(timeout);
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const send = () => {
    const isFormData = init.body instanceof FormData;
    return fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(init.headers ?? {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
  };

  let res = await send();

  if (res.status === 401 && !path.includes("/auth/")) {
    const token = await refreshAccessToken();
    if (token) res = await send();
  }
  return res;
}

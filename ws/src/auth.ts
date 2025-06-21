import { env } from "./env";

export async function authenticateSession(cookie: string | undefined): Promise<string | null> {
  if (!cookie) return null;
  try {
    const response = await fetch(`${env.API_URL}/_allauth/browser/v1/auth/session`, {
      headers: { Cookie: cookie },
    });
    if (response.ok) {
      const { data } = await response.json();
      return data?.user?.id || null;
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

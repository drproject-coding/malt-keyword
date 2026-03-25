/**
 * Server-side NCB client.
 * Uses the secret key for direct admin access — never expose to the browser.
 */

const BASE = process.env.NCB_DATA_API_URL!;
const INSTANCE = process.env.NCB_INSTANCE!;
const SECRET = process.env.NCB_SECRET_KEY!;

function url(path: string, params?: Record<string, string>) {
  const q = new URLSearchParams({ Instance: INSTANCE, ...params });
  return `${BASE}/${path}?${q.toString()}`;
}

const headers = {
  "Content-Type": "application/json",
  "X-Database-Instance": INSTANCE,
  get Authorization() {
    return `Bearer ${SECRET}`;
  },
};

export async function ncbInsert(table: string, data: Record<string, unknown>) {
  const res = await fetch(url(`create/${table}`), {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NCB insert failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function ncbFind(
  table: string,
  filter: Record<string, string>,
): Promise<Record<string, unknown>[]> {
  const res = await fetch(url(`read/${table}`, filter), { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NCB read failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  // NCB may return { data: [...] } or an array directly
  return Array.isArray(data) ? data : (data.data ?? []);
}

export async function ncbUpdate(
  table: string,
  id: string | number,
  data: Record<string, unknown>,
) {
  const res = await fetch(url(`update/${table}/${id}`), {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NCB update failed (${res.status}): ${text}`);
  }
  return res.json();
}

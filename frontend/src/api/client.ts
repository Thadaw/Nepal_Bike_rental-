export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const hasBody = options.body !== undefined;
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: hasBody && !isForm ? { "Content-Type": "application/json" } : undefined,
    body: hasBody ? (isForm ? (options.body as FormData) : JSON.stringify(options.body)) : undefined,
    signal: options.signal,
  });

  if (!response.ok) throw new ApiError(`Request failed (${response.status})`, response.status);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

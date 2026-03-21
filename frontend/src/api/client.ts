const API_BASE_PATH = '/api/v1';

interface ApiClientRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  body?: BodyInit | null;
  signal?: AbortSignal;
}

export interface ApiClientErrorPayload {
  status: number;
  statusText: string;
  url: string;
  bodyText: string;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly bodyText: string;

  constructor(payload: ApiClientErrorPayload) {
    super(
      `API request failed (${payload.status} ${payload.statusText}) for ${payload.url}`
    );
    this.name = 'ApiClientError';
    this.status = payload.status;
    this.statusText = payload.statusText;
    this.url = payload.url;
    this.bodyText = payload.bodyText;
  }
}

const makeUrl = (path: string): string => {
  if (!path.startsWith('/')) {
    throw new Error(`apiClient path must start with "/": received "${path}"`);
  }
  return `${API_BASE_PATH}${path}`;
};

export const apiClient = async <TResponse>(
  path: string,
  options: ApiClientRequestOptions = {}
): Promise<TResponse> => {
  const url = makeUrl(path);
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
    body: options.body ?? null,
    signal: options.signal,
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new ApiClientError({
      status: response.status,
      statusText: response.statusText,
      url,
      bodyText,
    });
  }

  return (await response.json()) as TResponse;
};

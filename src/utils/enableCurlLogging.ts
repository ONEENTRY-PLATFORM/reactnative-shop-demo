// Lightweight fetch wrapper that logs curl for requests to a given base URL
// Safe for React Native. Does not consume Request body streams.

type AnyHeaders = HeadersInit | undefined;

function headersToArray(headers: AnyHeaders): [string, string][] {
  const result: [string, string][] = [];
  if (!headers) return result;

  if (Array.isArray(headers)) {
    for (const [k, v] of headers) {
      result.push([String(k), String(v)]);
    }
    return result;
  }

  if (headers instanceof Headers) {
    headers.forEach((v, k) => result.push([k, v]));
    return result;
  }

  // Record<string, string>
  for (const k of Object.keys(headers as Record<string, string>)) {
    const v = (headers as Record<string, string>)[k];
    result.push([k, String(v)]);
  }
  return result;
}

function shellEscape(s: string) {
  // Basic POSIX single-quote escaping
  if (s === '') return "''";
  return `'${s.replace(/'/g, "'\\''")}'`;
}

const SECRET_HEADERS = ['x-app-token', 'authorization', 'x-device-metadata'];
const SECRET_BODY_URL =
  /users-auth-providers|\/auth\b|refresh|logout|change-password|password/i;

function buildCurl(opts: {
  method: string;
  url: string;
  headers: [string, string][];
  body?: BodyInit | null;
}) {
  const {method, url} = opts;
  const parts: string[] = [
    'curl',
    '-i',
    '-X',
    method.toUpperCase(),
    shellEscape(url),
  ];

  for (const [k, v] of opts.headers) {
    // Skip some noisy RN-specific headers if present
    if (k.toLowerCase() === 'accept-encoding') continue;
    // never print credentials
    const value = SECRET_HEADERS.includes(k.toLowerCase()) ? '<redacted>' : v;
    parts.push('-H', shellEscape(`${k}: ${value}`));
  }

  const body = opts.body as any;
  if (body != null && SECRET_BODY_URL.test(url)) {
    // sign-in / sign-up / token bodies carry passwords and refresh tokens
    parts.push('--data-raw', "'<redacted>'");
  } else if (body != null && method.toUpperCase() !== 'GET') {
    try {
      if (typeof body === 'string') {
        parts.push('--data-raw', shellEscape(body));
      } else if (
        typeof URLSearchParams !== 'undefined' &&
        body instanceof URLSearchParams
      ) {
        parts.push('--data-raw', shellEscape(body.toString()));
      } else if (typeof FormData !== 'undefined' && body instanceof FormData) {
        parts.push('# note: multipart/form-data body omitted');
      }
    } catch (_e) {
      // Ignore body if we can't safely inspect it
    }
  }

  return parts.join(' ');
}

export function enableFetchCurlLogger(
  baseUrl: string,
  enabled: boolean = true,
) {
  if (!enabled) return;
  if (
    typeof globalThis === 'undefined' ||
    typeof (globalThis as any).fetch !== 'function'
  )
    return;

  const g: any = globalThis as any;
  if (g.__fetchCurlLoggerPatched) return; // idempotent

  const originalFetch: typeof fetch = g.fetch.bind(g);

  g.fetch = (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    try {
      // Resolve URL
      const url: string =
        typeof input === 'string'
          ? input
          : (input as any)?.url || String(input);

      // Only log requests to baseUrl
      if (typeof url === 'string' && url.startsWith(baseUrl)) {
        const method = (
          init?.method ||
          (input as any)?.method ||
          'GET'
        ).toUpperCase();

        // Merge headers preference: init overrides request headers
        let headerPairs: [string, string][] = [];
        try {
          const initHeaders = headersToArray(init?.headers);
          const reqHeaders = headersToArray((input as any)?.headers);
          const merged: Record<string, string> = {};
          for (const [k, v] of reqHeaders) merged[k.toLowerCase()] = v;
          for (const [k, v] of initHeaders) merged[k.toLowerCase()] = v;
          headerPairs = Object.entries(merged).map(([k, v]) => [k, v]);
        } catch (_e) {}

        const body = init?.body ?? null; // do not attempt to read Request body streams
        const curl = buildCurl({method, url, headers: headerPairs, body});

        console.log('[curl]', curl);
      }
    } catch (_e) {
      // swallow logging errors
    }

    return originalFetch(input as any, init as any);
  };

  g.__fetchCurlLoggerPatched = true;
}

export default enableFetchCurlLogger;

import { useCallback, useEffect, useState } from 'react';

export interface ApiDataState<T> {
  data: T | null;
  loading: boolean;
  /** The backend could not be reached and `data` is the demo fallback (or null). */
  usingMock: boolean;
  error: string | null;
  /** HTTP status when the server answered. Null if the request never landed —
   *  that difference separates "backend is down" from "server said no". */
  status: number | null;
  reload: () => void;
}

/**
 * Fetch-with-graceful-fallback, the pattern every live view on the golden path
 * shares. When the backend is unreachable the view keeps rendering from the
 * demo fallback and flags it, so a frontend-only deployment still works.
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  fallback: T | null = null,
): ApiDataState<T> {
  const [data, setData] = useState<T | null>(fallback);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcher()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setUsingMock(false);
        setError(null);
        setStatus(200);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const res = (err as { response?: { status?: number; data?: { detail?: string } } })
          .response;
        const code = res?.status ?? null;
        setStatus(code);
        setData(fallback);
        // "Demo mode" means the backend could not be reached: either the request
        // never landed (no status) or a gateway/5xx answered for it — a dev-server
        // proxy returns 502 when the API is down. A 4xx is the API itself
        // answering, and the view should report what it actually said.
        const unreachable = code == null || code >= 500;
        setUsingMock(unreachable);
        if (unreachable) {
          console.warn('Backend unavailable, falling back to demo data', err);
        }
        setError(
          res?.data?.detail ?? (err instanceof Error ? err.message : 'Request failed'),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // `fetcher` and `fallback` are treated as stable for a given mount; `tick`
    // is the explicit refetch signal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return { data, loading, usingMock, error, status, reload };
}

/** Amounts arrive as serialized decimals; render them as TZS. */
export function formatTZS(value: string | number | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : (value ?? 0);
  return `TZS ${Math.round(n).toLocaleString()}`;
}

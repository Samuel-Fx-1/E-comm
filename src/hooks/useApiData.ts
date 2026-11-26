import { useEffect, useRef, useState } from 'react';
import type { DependencyList } from 'react';

export interface ApiDataState<T> {
  data: T;
  /** True while a request for the current dependencies is in flight. */
  loading: boolean;
  /** Set when the API failed and `data` is the supplied fallback. */
  error: Error | null;
}

function fallbackValue<T>(fallback: T | (() => T)): T {
  return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
}

/**
 * Runs an API loader with abort support. Network/API failures are swallowed and
 * replaced by `fallback`, so callers always have something to render. Stale data
 * stays on screen while a new request resolves.
 */
export function useApiData<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
  fallback: T | (() => T)
): ApiDataState<T> {
  const loaderRef = useRef(loader);
  const fallbackRef = useRef(fallback);
  loaderRef.current = loader;
  fallbackRef.current = fallback;

  const [state, setState] = useState<ApiDataState<T>>(() => ({
    data: fallbackValue(fallback),
    loading: true,
    error: null,
  }));

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    loaderRef.current(controller.signal)
      .then((data) => {
        if (!active || controller.signal.aborted) return;
        setState({ data, loading: false, error: null });
      })
      .catch((reason: unknown) => {
        if (!active || controller.signal.aborted) return;
        setState({
          data: fallbackValue(fallbackRef.current),
          loading: false,
          error: reason instanceof Error ? reason : new Error(String(reason)),
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
    // `loader` and `fallback` are read through refs; `deps` controls refetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

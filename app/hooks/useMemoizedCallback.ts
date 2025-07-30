import { useCallback, useRef } from 'react';

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef<T>(callback);
  ref.current = callback;

  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, deps) as T;
} 
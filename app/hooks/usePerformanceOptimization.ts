import { useCallback, useEffect, useMemo, useRef } from 'react';
import { InteractionManager } from 'react-native';

export function usePerformanceOptimization() {
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debounce = useCallback((func: Function, delay: number) => {
    return (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          func(...args);
        }
      }, delay);
    };
  }, []);

  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean;
    return (...args: any[]) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  const runAfterInteractions = useCallback((callback: () => void) => {
    InteractionManager.runAfterInteractions(() => {
      if (mountedRef.current) {
        callback();
      }
    });
  }, []);

  const memoizedCallback = useCallback(<T extends (...args: any[]) => any>(
    callback: T,
    deps: any[]
  ): T => {
    return useCallback(callback, deps) as T;
  }, []);

  const memoizedValue = useCallback(<T>(value: T, deps: any[]): T => {
    return useMemo(() => value, deps);
  }, []);

  return {
    debounce,
    throttle,
    runAfterInteractions,
    memoizedCallback,
    memoizedValue,
    isMounted: () => mountedRef.current,
  };
}

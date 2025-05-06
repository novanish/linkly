import { useRef, useEffect } from 'react';

export function useIsUnmounted() {
  const unmountedRef = useRef(false);

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  return unmountedRef;
}

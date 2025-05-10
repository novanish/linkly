import { useEffect } from 'react';
import { useRevalidator } from 'react-router';

interface Options {
  enabled?: boolean;
  interval?: number;
}

export function useRevalidateOnInterval({
  enabled = false,
  interval = 1000,
}: Options) {
  const { revalidate } = useRevalidator();

  useEffect(() => {
    if (!enabled) return;
    const intervalId = setInterval(revalidate, interval);

    return () => clearInterval(intervalId);
  }, [revalidate, enabled, interval]);
}

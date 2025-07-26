import { useEffect } from 'react';
import { href, useRevalidator } from 'react-router';
import { useEventSource } from 'remix-utils/sse/react';

export function useRevalidateOnLinkUpdate() {
  const { revalidate } = useRevalidator();
  const message = useEventSource(href('/dashboard/stream-links'), {
    event: 'linkUpdate',
  });

  useEffect(() => {
    revalidate();
  }, [message, revalidate]);
}

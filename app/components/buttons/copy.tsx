import { useState } from 'react';
import { useIsUnmounted } from '~/hooks/use-is-unmounted';
import { Button } from '../ui/button';
import { cn } from '~/lib/utils';
import { Check, Copy } from 'lucide-react';

interface Props extends React.ComponentProps<typeof Button> {
  text: string;
  onSuccess?: () => void;
  onError?: (e: unknown) => void;
  iconOnly?: boolean;
}

export function CopyButton({
  onSuccess,
  onError,
  text,
  iconOnly = true,
  ...props
}: Props) {
  const [copied, setCopied] = useState(false);
  const isUnMounted = useIsUnmounted();

  async function handleCopy() {
    try {
      await window.navigator.clipboard.writeText(text);
      setCopied(true);
      onSuccess?.();

      setTimeout(() => {
        if (!isUnMounted.current) {
          setCopied(false);
        }
      }, 700);
    } catch (e) {
      onError?.(e);
    }
  }

  return (
    <Button
      type="button"
      {...props}
      onClick={handleCopy}
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        copied
          ? 'border-green-200 bg-green-50 text-green-600'
          : 'bg-transparent',
        props.className,
      )}
      aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
    >
      <span
        className={cn('flex items-center gap-2', iconOnly ? 'sr-only' : '')}
      >
        {copied ? 'Copied!' : 'Copy'}
      </span>

      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-transform duration-300',
          copied ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
        )}
      >
        <Check className="h-4 w-4" />
      </span>

      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-transform duration-300',
          copied ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100',
        )}
      >
        <Copy className="h-4 w-4" />
      </span>
    </Button>
  );
}

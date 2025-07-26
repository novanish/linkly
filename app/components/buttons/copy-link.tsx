import { toast } from 'sonner';
import { CopyButton } from './copy';

interface Props extends React.ComponentProps<typeof CopyButton> {
  shortUrl: string;
  showToast?: boolean;
}

export function CopyLinkButton({
  shortUrl,
  showToast = true,
  ...props
}: Props) {
  return (
    <CopyButton
      {...props}
      variant="outline"
      text={shortUrl}
      onSuccess={() => {
        if (showToast) toast.success('');
      }}
    />
  );
}

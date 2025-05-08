import { Loader2 } from 'lucide-react';
import { useFetcher } from 'react-router';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';

interface Props {
  linkId: string;
  actionValue: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDialog({
  actionValue,
  linkId,
  open,
  onOpenChange,
}: Props) {
  const fetcher = useFetcher();
  const isDeleting = fetcher.state === 'submitting';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your link
            and remove your link analytics from our server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              disabled={isDeleting}
              type="submit"
              name="__action"
              value={actionValue}
              onClick={async (e) => {
                e.preventDefault();
                const data = {
                  __action: actionValue,
                  linkId,
                };
                await fetcher.submit(data, { method: 'POST' });
              }}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

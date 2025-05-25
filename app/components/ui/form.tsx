import * as React from 'react';
import { cn } from '~/lib/utils';
import { Label } from '~/components/ui/label';

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-2', className)} {...props} />
));
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label ref={ref} className={className} {...props} />
));
FormLabel.displayName = 'FormLabel';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
));
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { error?: string }
>(({ className, children, error, ...props }, ref) => {
  const message = error || children;
  if (!message) return null;

  return (
    <p
      ref={ref}
      className={cn('text-destructive text-sm font-medium', className)}
      {...props}
    >
      {message}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

export { FormItem, FormLabel, FormDescription, FormMessage };

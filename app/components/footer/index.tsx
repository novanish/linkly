import { Link2 } from 'lucide-react';
import { APP_NAME } from '~/lib/consts';

export function Footer() {
  return (
    <footer className="mt-7 border-t py-6">
      <div className="container flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-rose-500" />
          <span className="text-lg font-semibold">{APP_NAME}</span>
        </div>
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

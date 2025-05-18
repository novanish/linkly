import { Link2 } from 'lucide-react';
import { Link, Outlet } from 'react-router';
import { Footer } from '~/components/footer';
import { APP_NAME } from '~/lib/consts';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 w-full border-b backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold">{APP_NAME}</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-md">
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-linear-to-br from-rose-400 to-amber-300 opacity-20 blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-linear-to-tr from-rose-500 to-amber-200 opacity-20 blur-3xl"></div>

          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}

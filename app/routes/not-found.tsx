import { Home, Link2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Footer } from '~/components/footer';
import { Button } from '~/components/ui/button';
import { APP_NAME } from '~/lib/consts';

export default function NotFoundPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold">{APP_NAME}</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-md">
          {/* Decorative gradients */}
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-rose-400 to-amber-300 opacity-10 blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-gradient-to-tr from-rose-500 to-amber-200 opacity-10 blur-3xl"></div>

          <div className="space-y-8 text-center">
            {/* Animated 404 text */}
            <div className="relative h-32 overflow-hidden">
              <div
                className={`absolute inset-0 flex items-center justify-center text-9xl font-extrabold text-rose-500 opacity-10 transition-all duration-1000 ${
                  mounted ? 'scale-150 blur-xl' : 'scale-100 blur-none'
                }`}
              >
                404
              </div>
              <div
                className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-8xl font-extrabold text-transparent transition-all duration-1000 ${
                  mounted ? 'scale-100' : 'scale-50 opacity-0'
                }`}
              >
                404
              </div>
            </div>

            <h1 className="text-3xl font-bold">Page Not Found</h1>

            <p className="text-muted-foreground mx-auto max-w-sm">
              Oops! The page you're looking for doesn't exist or has been moved
              to a different location.
            </p>

            <div className="relative mx-auto my-8 h-24 w-24">
              <div
                className={`absolute inset-0 transition-all duration-700 ${
                  mounted ? 'rotate-0 opacity-100' : 'rotate-45 opacity-0'
                }`}
              >
                <div className="relative h-full w-full">
                  <div className="absolute top-1/2 left-0 h-3 w-10 -translate-y-1/2 transform rounded-full bg-rose-200"></div>
                  <div className="absolute top-1/2 right-0 h-3 w-10 -translate-y-1/2 transform rounded-full bg-rose-200"></div>
                  <div className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-rose-500"></div>
                </div>
              </div>
              <div
                className={`absolute inset-0 transition-all delay-300 duration-700 ${
                  mounted ? 'rotate-0 opacity-100' : '-rotate-45 opacity-0'
                }`}
              >
                <div className="relative h-full w-full">
                  <div className="absolute top-1/2 left-0 h-3 w-10 -translate-y-1/2 transform rounded-full bg-amber-200"></div>
                  <div className="absolute top-1/2 right-0 h-3 w-10 -translate-y-1/2 transform rounded-full bg-amber-200"></div>
                  <div className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-amber-500"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                className="bg-rose-500 hover:bg-rose-600"
                size="lg"
                asChild
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Homepage
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

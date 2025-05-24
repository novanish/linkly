import { Link2 } from 'lucide-react';
import { Link, Outlet } from 'react-router';
import { Footer } from '~/components/footer';
import { APP_NAME } from '~/lib/consts';
import type { Route } from './+types/authenticated-layout';
import { authSession } from '~/auth/session.server';
import { UserButton } from '~/components/buttons/user-button';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await authSession.require(request);
  return { user };
}

export default function AuthenticatedLayout({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-4">
            <UserButton {...loaderData.user} />
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8">
        <div className="flex flex-col gap-8">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

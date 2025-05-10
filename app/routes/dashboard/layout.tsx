import { Link2, Plus } from 'lucide-react';
import { Link, Outlet } from 'react-router';
import { UserButton } from '~/components/buttons/user-button';
import { Footer } from '~/components/footer';
import { Button } from '~/components/ui/button';
import { Dialog, DialogTrigger } from '~/components/ui/dialog';
import { APP_NAME } from '~/lib/consts';
import { DashboardSubNav } from './_components/nav/sub-nav';
import type { Route } from './+types/layout';
import { authSession } from '~/auth/session.server';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await authSession.require(request);
  return { user };
}

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
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
          {/* Dashboard Header */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your short links and view analytics
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-rose-500 hover:bg-rose-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Link
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          <DashboardSubNav />

          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

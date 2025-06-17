import { Plus } from 'lucide-react';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { href, Link, Outlet } from 'react-router';
import { Button } from '~/components/ui/button';
import { Dialog, DialogTrigger } from '~/components/ui/dialog';
import { DashboardSubNav } from './_components/nav/sub-nav';

export default function DashboardLayout() {
  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your short links and view analytics
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-rose-500 hover:bg-rose-600" asChild>
              <Link to={href('/link/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Link
              </Link>
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <DashboardSubNav />

      <NuqsAdapter>
        <Outlet />
      </NuqsAdapter>
    </>
  );
}

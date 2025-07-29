import { BarChart2, Link2 } from 'lucide-react';
import { href, NavLink } from 'react-router';
import { cn } from '~/lib/utils';

const items = [
  {
    title: 'Overview',
    href: href('/dashboard/overview'),
    icon: <Link2 className="h-4 w-4" />,
  },
  {
    title: 'My Links',
    href: href('/dashboard/links'),
    icon: <Link2 className="h-4 w-4" />,
  },
  {
    title: 'Analytics',
    href: href('/dashboard/analytics/:linkId?'),
    icon: <BarChart2 className="h-4 w-4" />,
  },
];

export function DashboardSubNav() {
  return (
    <nav className="mb-8 flex space-x-2 border-b pb-2 lg:space-x-4">
      {items.map((item) => (
        <NavLink
          prefetch="intent"
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )
          }
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}

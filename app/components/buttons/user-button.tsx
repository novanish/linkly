import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { ChevronDown, LayoutDashboard, LogOut } from 'lucide-react';
import { Form, Link } from 'react-router';

interface Props {
  name?: string | null;
  email: string;
  avatarUrl?: string | null;
}

export function UserButton({ email, avatarUrl, name }: Props) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : email
        .split('@')[0]
        .split('.')
        .map((n) => n[0])
        .join('');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="User Avatar" />
            ) : null}
            <AvatarFallback className="bg-rose-100 text-rose-500">
              {initials.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {name ? <span className="hidden md:inline-block">{name}</span> : null}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/dashboard/overview"
            className="flex w-full items-center gap-2"
          >
            <LayoutDashboard />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Form method="post" action="/auth/logout">
            <button
              type="submit"
              className="flex w-full items-center gap-2 text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

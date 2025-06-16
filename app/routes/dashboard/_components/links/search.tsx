import { Button } from '~/components/ui/button';
import { Loader, Search } from 'lucide-react';
import { Form, useNavigation, useSearchParams } from 'react-router';
import { Input } from '~/components/ui/input';

export function SearchBar() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('s') ?? '';
  const navigation = useNavigation();
  const isSearching =
    navigation.state === 'loading' &&
    navigation.formData?.get('s') !== undefined;

  return (
    <Form
      method="GET"
      className="flex w-full max-w-sm items-center space-x-2"
      preventScrollReset
    >
      {Array.from(searchParams.entries()).map(([key, value]) => {
        if (key === 's' || key === 'p') return null;
        return <input key={key} type="hidden" name={key} value={value} />;
      })}

      <Input
        type="text"
        enterKeyHint="search"
        placeholder="Search links..."
        name="s"
        className="h-9"
        defaultValue={search}
      />
      <Button type="submit" size="sm" className="px-3">
        {isSearching ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        <span className="sr-only">{isSearching ? 'Searching' : 'Search'}</span>
      </Button>
    </Form>
  );
}

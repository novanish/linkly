import { parseWithZod } from '@conform-to/zod/v4';
import { href, redirect } from 'react-router';
import { authSession } from '~/auth/session.server';
import { createLink, isDuplicateCustomAliasError } from '~/models/links.server';
import { createLinkSchema } from '~/validations/link.schema';
import type { Route } from './+types/create';
import { SingleLinkCreator } from './_components/single-link-creator';

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = await parseWithZod(formData, { schema: createLinkSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }
  const user = await authSession.require(request);

  try {
    await createLink({
      userId: user.id,
      customAlias: submission.value.customAlias,
      isActive: submission.value.isActive,
      originalUrl: submission.value.originalUrl,
      trackClicks: submission.value.trackClicks,
    });
  } catch (error) {
    if (isDuplicateCustomAliasError(error)) {
      return {
        ...submission.reply(),
        error: {
          customAlias: ['Custom alias already exists. Please choose another.'],
        },
      };
    }

    throw error;
  }

  return redirect(href('/dashboard/links'));
}

export default function CreateLink() {
  return (
    <>
      <div className="flex flex-col space-y-2 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Create Links</h1>
          <p className="text-muted-foreground">
            Generate single link shorteners with customizable options, including
            custom aliases, tracking, and activation status.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl p-4">
        <SingleLinkCreator />
      </div>
    </>
  );
}

export const meta: Route.MetaDescriptors = [{ title: 'Create Links' }];

import { parseWithZod } from '@conform-to/zod/v4';
import { href, redirect } from 'react-router';
import { authSession } from '~/auth/session.server';
import {
  getLinkForEdit,
  isDuplicateCustomAliasError,
  updateLink,
} from '~/models/links.server';
import { updateLinkSchema } from '~/validations/link.schema';
import type { Route } from './+types/edit';
import { SingleLinkCreator } from './_components/single-link-creator';

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await authSession.require(request);
  const linkId = params.linkId;
  const link = await getLinkForEdit({ linkId, userId: user.id });
  if (!link) {
    throw new Response('Link not found', { status: 404 }); // TODO: Add not found ui
  }

  return link;
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = await parseWithZod(formData, { schema: updateLinkSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }
  const user = await authSession.require(request);
  const linkId = params.linkId;

  try {
    await updateLink(user.id, linkId, {
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

export default function UpdateLink({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <div className="flex flex-col space-y-2 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Update Link</h1>
          <p className="text-muted-foreground">
            Update single link shorteners with customizable options, including
            custom aliases, tracking, and activation status.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl p-4">
        <SingleLinkCreator
          defaultValues={{
            ...loaderData,
            isActive: loaderData?.isActive ? 'on' : 'off',
            trackClicks: loaderData.trackClicks ? 'on' : 'off',
          }}
          isEdit
        />
      </div>
    </>
  );
}

export const meta: Route.MetaDescriptors = [{ title: 'Update Link' }];

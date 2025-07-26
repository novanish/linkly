import { parseWithZod } from '@conform-to/zod/v4';
import { href, isRouteErrorResponse, Link, redirect } from 'react-router';
import { authSession } from '~/auth/session.server';
import { Button } from '~/components/ui/button';
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
    throw new Response('Link not found', { status: 404 });
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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (!isRouteErrorResponse(error) || error.status !== 404) {
    throw error;
  }

  return (
    <div className="space-y-8 text-center">
      <div className="relative h-32 overflow-hidden">
        <div
          className={`absolute inset-0 flex items-center justify-center text-9xl font-extrabold text-rose-500 opacity-10 transition-all duration-1000`}
        >
          404
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-8xl font-extrabold text-transparent transition-all duration-1000`}
        >
          404
        </div>
      </div>

      <h1 className="text-3xl font-bold">Link Not Found</h1>

      <p className="text-muted-foreground mx-auto max-w-sm">
        Oops! The link you're looking for doesn't exist.
      </p>

      <div className="relative mx-auto my-5 h-24 w-24">
        <div className={`absolute inset-0 transition-all duration-700`}>
          <div className="relative h-full w-full">
            <div className="absolute top-1/2 left-0 h-3 w-10 -translate-y-1/2 transform rounded-full bg-rose-200"></div>
            <div className="absolute top-1/2 right-0 h-3 w-10 -translate-y-1/2 transform rounded-full bg-rose-200"></div>
            <div className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-rose-500"></div>
          </div>
        </div>
        <div
          className={`absolute inset-0 transition-all delay-300 duration-700`}
        >
          <div className="relative h-full w-full">
            <div className="absolute top-1/2 left-0 h-3 w-10 -translate-y-1/2 transform rounded-full bg-amber-200"></div>
            <div className="absolute top-1/2 right-0 h-3 w-10 -translate-y-1/2 transform rounded-full bg-amber-200"></div>
            <div className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-amber-500"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Button className="bg-rose-500 hover:bg-rose-600" size="lg" asChild>
          <Link prefetch="intent" to={href('/dashboard/links')}>
            Back to Links
          </Link>
        </Button>
      </div>
    </div>
  );
}

export const meta: Route.MetaDescriptors = [{ title: 'Update Link' }];

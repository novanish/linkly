import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod/v4';
import { Camera, Loader2 } from 'lucide-react';
import { useRef } from 'react';
import {
  Form,
  href,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router';
import { authSession } from '~/auth/session.server';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { updateUserById } from '~/models/users.server';
import {
  updateProfileSchema,
  type UpdateProfileSchema,
} from '~/validations/user.schema';
import type { Route } from './+types/profile';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await authSession.require(request);

  return {
    name: user.name,
    email: user.email,
    profileImage: user.avatarUrl,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: updateProfileSchema,
  });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const userId = await authSession.getUserId(request);
  if (!userId) throw redirect(href('/auth/login'));

  await updateUserById(userId, submission.value);

  return null;
}

export default function ProfilePage() {
  return (
    <>
      <div className="flex flex-col space-y-2 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Update your profile information and manage your account settings.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <ProfileForm />
      </div>
    </>
  );
}

export function ProfileForm() {
  const navigation = useNavigation();
  const { email, name } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm<UpdateProfileSchema>({
    lastResult,

    defaultValue: {
      name: name || 'hello',
    },

    onSubmit(event) {
      if (!form.dirty) event.preventDefault();
    },

    shouldRevalidate: 'onBlur',

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateProfileSchema });
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmitting = navigation.state === 'submitting';

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your profile photo and personal details here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          method="POST"
          onSubmit={form.onSubmit}
          id={form.id}
          className="space-y-8"
        >
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="border-background h-32 w-32 overflow-hidden rounded-full border-4 shadow-xl">
                  {/* <img
                      src={previewImage || user.profileImage}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                    /> */}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-0 bottom-0 rounded-full bg-rose-500 p-2 text-white shadow-sm hover:bg-rose-600 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:outline-none"
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Change profile picture</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
              />
              <p className="text-muted-foreground text-sm">
                Click the camera icon to upload a new photo
              </p>
            </div>

            <div className="flex-1 space-y-6">
              <FormItem>
                <FormLabel>Name</FormLabel>
                <Input
                  placeholder="Your name"
                  defaultValue={fields.name.value}
                  name={fields.name.name}
                />
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage error={fields.name.errors?.[0]} />
              </FormItem>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Email Address</h3>
                <div className="flex items-center gap-2">
                  <Input value={email} disabled />
                </div>
                <p className="text-muted-foreground text-sm">
                  Your email address is used for login.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-rose-500 hover:bg-rose-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

export const meta: Route.MetaDescriptors = [
  {
    title: 'Profile Settings',
    description:
      'Update your profile information and manage your account settings.',
  },
];

import {
  FormProvider,
  useField,
  useForm,
  type FieldName,
} from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod/v4';
import { Power } from 'lucide-react';
import {
  Form,
  href,
  useActionData,
  useNavigate,
  useNavigation,
  useSubmit,
} from 'react-router';
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
import { Switch } from '~/components/ui/switch';
import { createLinkSchema } from '~/validations/link.schema';

interface Props {
  defaultValues?: {
    isActive?: string;
    trackClicks?: string;
    originalUrl?: string;
    customAlias?: string | null;
  };

  isEdit?: boolean;
}

export function SingleLinkCreator({ defaultValues = {}, isEdit }: Props) {
  const navigate = useNavigate();
  const submit = useSubmit();
  const actionData = useActionData();

  const [form, fields] = useForm({
    id: 'create-single-link-form',
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createLinkSchema });
    },

    defaultValue: {
      isActive: 'on',
      trackClicks: 'on',
      ...defaultValues,
    },

    onSubmit(event, context) {
      if (!isEdit) return;

      if (!form.dirty) {
        event.preventDefault();
        navigate(href('/dashboard/links'));
        return;
      }

      const formData = context.formData;
      if (formData.get('originalUrl') !== defaultValues.originalUrl) return;

      event.preventDefault();
      formData.delete('originalUrl');
      submit(formData, { method: context.method });
    },
  });

  const navigation = useNavigation();
  const isCreating = navigation.state === 'submitting';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Update' : 'Create'} Single Link</CardTitle>
        <CardDescription>
          {isEdit
            ? 'Update a single shortened link with custom aliases.'
            : 'Generate a single shortened link with custom aliases.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <FormProvider context={form.context}>
            <Form
              className="space-y-6"
              method="POST"
              onSubmit={form.onSubmit}
              id={form.id}
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Original URL *</FormLabel>
                    <FormDescription>
                      Enter the full URL you want to shorten (must include
                      http:// or https://)
                    </FormDescription>
                    <Input
                      placeholder="https://www.example.com/your-long-url-here"
                      defaultValue={fields.originalUrl.initialValue}
                      name={fields.originalUrl.name}
                    />
                    <FormMessage error={fields.originalUrl.errors?.[0]} />
                  </FormItem>
                </div>

                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Custom Alias (Optional)</FormLabel>
                    <FormDescription>
                      Create a memorable custom short URL (letters, numbers, and
                      hyphens only)
                    </FormDescription>
                    <Input
                      placeholder="my-awesome-link"
                      defaultValue={fields.customAlias.initialValue}
                      name={fields.customAlias.name}
                    />
                    <FormMessage error={fields.customAlias.errors?.[0]} />
                  </FormItem>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TrackClicksSwitch
                  name={fields.trackClicks.name as FieldName<string>}
                />
                <ActiveLinkSwitch
                  name={fields.isActive.name as FieldName<string>}
                />
              </div>

              <Button
                type="submit"
                className="ml-auto block bg-rose-500 hover:bg-rose-600"
              >
                {isCreating
                  ? isEdit
                    ? 'Updating Link...'
                    : 'Creating Link...'
                  : isEdit
                    ? 'Update Link'
                    : 'Create Link'}
              </Button>
            </Form>
          </FormProvider>
        </div>
      </CardContent>
    </Card>
  );
}

function TrackClicksSwitch({ name }: { name: FieldName<string> }) {
  const [field] = useField(name);
  const checked = field.value === 'on';

  return (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel className="text-base">Track Clicks</FormLabel>
        <FormDescription>
          {checked
            ? 'Enable to track how many times your link is clicked'
            : 'Disable to stop tracking clicks on this link'}
        </FormDescription>
      </div>
      <Switch defaultChecked={checked} name={field.name} />
    </FormItem>
  );
}

function ActiveLinkSwitch({ name }: { name: FieldName<string> }) {
  const [field] = useField(name);
  const checked = field.value === 'on';

  return (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel className="flex items-center gap-2 text-base">
          <Power className="h-4 w-4" />
          Link Status
        </FormLabel>
        <FormDescription>
          {checked
            ? 'Link will be active and accessible'
            : 'Link will be inactive and inaccessible'}
        </FormDescription>
      </div>
      <Switch defaultChecked={checked} name={field.name} />
    </FormItem>
  );
}

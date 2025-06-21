import { useCallback, useEffect, useState } from 'react';
import { Form, useSearchParams } from 'react-router';
import QRCode from 'qrcode';
import { Button } from '~/components/ui/button';
import { FormItem, FormLabel } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Card, CardContent } from '~/components/ui/card';
import { toast } from 'sonner';

export default function CreateQr() {
  return (
    <>
      <div className="flex flex-col space-y-2 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            QR Code Generator
          </h1>
          <p className="text-muted-foreground">
            Generate customizable QR codes for your shortened links with
            advanced styling options and high-quality output.
          </p>
        </div>
      </div>

      <Card className="container mx-auto max-w-4xl">
        <CardContent>
          <QrCodeGenerator />
        </CardContent>
      </Card>
    </>
  );
}

function throtle<T extends (...args: any[]) => void>(func: T, delay: number) {
  let canCall = true;

  return function (...args: Parameters<T>) {
    if (canCall) {
      func(...args);
      canCall = false;
      setTimeout(() => {
        canCall = true;
      }, delay);
    }
  };
}

export function QrCodeGenerator() {
  const [searchParams] = useSearchParams();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [colors, setColors] = useState({
    foreground: '#000000',
    background: '#FFFFFF',
  });

  async function onSubmit() {
    try {
      const url = await QRCode.toDataURL(
        searchParams.get('url') || window.location.href,
        {
          width: 500,
          color: {
            dark: colors.foreground,
            light: colors.background,
          },
          errorCorrectionLevel: 'M',
          type: 'image/png',
        },
      );
      setQrCodeDataUrl(url);
    } catch (error) {
      toast.error('Failed to generate QR code. Please try again.');
    }
  }

  useEffect(() => {
    onSubmit();
  }, [colors]);

  const throttledSetColors = useCallback(throtle(setColors, 500), []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col-reverse space-y-6 md:flex-row md:space-y-0 md:space-x-6">
        <div className="rounded-lg md:w-1/3">
          <Form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <FormItem>
              <FormLabel>URL</FormLabel>
              <Input
                type="url"
                placeholder="https://example.com"
                value={searchParams.get('url') || 'www.youtube.com'}
                disabled
                name="url"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Foreground Color</FormLabel>
              <Input
                type="color"
                defaultValue={colors.foreground}
                name="foregroundColor"
                onChange={(e) => {
                  throttledSetColors((prev) => ({
                    ...prev,
                    foreground: e.target.value,
                  }));
                }}
              />
            </FormItem>

            <FormItem>
              <FormLabel>Background Color</FormLabel>
              <Input
                type="color"
                defaultValue={colors.background}
                name="backgroundColor"
                onChange={(e) => {
                  throttledSetColors((prev) => ({
                    ...prev,
                    background: e.target.value,
                  }));
                }}
              />
            </FormItem>
          </Form>
        </div>

        <div className="flex w-full flex-col items-center justify-center rounded-lg p-4 md:w-2/3">
          {qrCodeDataUrl ? (
            <>
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                className="h-auto max-w-full"
              />
              <Button className="mt-4" asChild>
                <a href={qrCodeDataUrl} download="qrcode.png">
                  Download QR Code
                </a>
              </Button>
            </>
          ) : (
            <p>Enter a URL to generate a QR code.</p>
          )}
        </div>
      </div>
    </div>
  );
}

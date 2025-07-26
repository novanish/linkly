import QRCode from 'qrcode';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { FormItem, FormLabel } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { throttle } from '~/lib/utils';

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

export function QrCodeGenerator() {
  const [searchParams] = useSearchParams();
  const qrStateRef = useRef({
    foreground: '#000000',
    background: '#FFFFFF',
    url: searchParams.get('url') || window.location.href,
  });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useLayoutEffect(() => {
    getQRCodeDataUrl(qrStateRef.current)
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch(() => {
        toast.error('Failed to generate QR code. Please try again.');
      });
  }, []);

  const createQr = useMemo(() => {
    return throttle(async () => {
      const qrState = qrStateRef.current;
      if (!qrState.url) {
        setQrCodeDataUrl('');
        return;
      }

      try {
        const url = await getQRCodeDataUrl(qrState);
        setQrCodeDataUrl(url);
      } catch {
        toast.error('Failed to generate QR code. Please try again.');
      }
    }, 500);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col-reverse space-y-6 md:flex-row md:space-y-0 md:space-x-6">
        <div className="rounded-lg md:w-1/3">
          <div className="space-y-6">
            <FormItem>
              <FormLabel>URL</FormLabel>
              <Input
                type="url"
                placeholder="https://example.com"
                defaultValue={qrStateRef.current.url}
                onChange={(e) => {
                  qrStateRef.current.url = e.target.value;
                  createQr();
                }}
                name="url"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Foreground Color</FormLabel>
              <Input
                type="color"
                defaultValue={qrStateRef.current.foreground}
                name="foregroundColor"
                onChange={(e) => {
                  qrStateRef.current.foreground = e.target.value;
                  createQr();
                }}
              />
            </FormItem>

            <FormItem>
              <FormLabel>Background Color</FormLabel>
              <Input
                type="color"
                defaultValue={qrStateRef.current.background}
                name="backgroundColor"
                onChange={(e) => {
                  qrStateRef.current.background = e.target.value;
                  createQr();
                }}
              />
            </FormItem>
          </div>
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

function getQRCodeDataUrl({
  background,
  foreground,
  url,
}: QRCodeState): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 500,
    color: {
      dark: foreground,
      light: background,
    },
    errorCorrectionLevel: 'M',
    type: 'image/png',
  });
}

type QRCodeState = {
  foreground: string;
  background: string;
  url: string;
};

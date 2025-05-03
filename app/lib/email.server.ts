import { Resend } from 'resend';
import { VerificationEmail } from '~/emails/verification-email';
import { env } from '~/env/server';
import { APP_NAME, MAGIC_LINK_EXPIRES_IN } from './consts';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendMagicLinkEmail({
  email,
  url,
}: Record<'email' | 'url', string>) {
  return resend.emails.send({
    from: env.RESEND_EMAIL_DOMAIN,
    to: email,
    subject: `Sign in to ${APP_NAME}`,
    react: VerificationEmail({
      userEmail: email,
      verificationUrl: url,
      expiryTime: MAGIC_LINK_EXPIRES_IN,
    }),
  });
}

import { Honeypot } from 'remix-utils/honeypot/server';
import { env } from '~/env/server';

export const honeypot = new Honeypot({
  encryptionSeed: env.HONEYPOT_SECRET,
});

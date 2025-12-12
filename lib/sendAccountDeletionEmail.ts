import { env } from '@/env.server';

export async function sendAccountDeletionEmail({
  email,
  fullName,
}: {
  email: string;
  fullName: string;
}) {
  if (env.USE_EMAIL_MOCK === 'true') {
    console.log(`[MOCK] Would send account deletion email to ${email} for user ${fullName}`);
    return;
  }

  throw new Error('AWS SES integration not implemented yet.');
}

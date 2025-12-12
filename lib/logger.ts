import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { env } from '@/env.server';

export function logError(message: string, context?: any) {
  console.error(`[ERROR]: ${message}`, context);
}

export function logInfo(message: string, context?: any) {
  console.info(`[INFO]: ${message}`, context);
}

export function logWarn(message: string, context?: any) {
  console.warn(`[WARN]: ${message}`, context);
}

function getServerSupabaseClient() {
  if (typeof window !== 'undefined') {
    throw new Error('getServerSupabaseClient() called in client environment');
  }

  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}

export async function logUserAction({
  userId,
  action,
  metadata = null,
}: {
  userId: string;
  action: string;
  metadata?: Record<string, any> | null;
}) {
  if (typeof window !== 'undefined') {
    try {
      const { createPagesBrowserClient } = await import('@supabase/auth-helpers-nextjs');
      const supabase = createPagesBrowserClient<Database>({
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      });
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await fetch('/api/user/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ userId, action, metadata }),
        keepalive: true,
      });
    } catch (e) {
      logWarn('Failed to send client log to API', { e, userId, action });
    }
    return;
  }

  try {
    const supabase = getServerSupabaseClient();
    const { error } = await supabase
      .from('user_log')
      .insert([{ user_id: userId, action, metadata }]);

    if (error) {
      logWarn('Failed to insert user_log', { error });
    } else {
      logInfo(`User action logged: ${action}`, { userId, metadata });
    }
  } catch (err) {
    logWarn('logger: service-role client init failed, skip user_log write', {
      message: err instanceof Error ? err.message : String(err),
      action,
    });
  }
}

export async function tryLogUserAction(args: {
  userId: string;
  action: string;
  metadata?: Record<string, any> | null;
}) {
  try {
    await logUserAction(args);
  } catch (e) {
    logWarn('tryLogUserAction suppressed error', {
      message: e instanceof Error ? e.message : String(e),
      action: args.action,
    });
  }
}

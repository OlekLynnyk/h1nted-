// lib/updateUserLimits.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { PACKAGE_LIMITS, ValidPackageType } from '@/types/plan';
import { Database } from '@/types/supabase';

export type LimitsResetMode = 'none' | 'daily' | 'monthly' | 'all';

type UpdateUserLimitsOptions = {
  reset?: LimitsResetMode;
  reason?: string;
};

type UserLimitsRow = Database extends { public: any }
  ? Database['public']['Tables']['user_limits']['Row']
  : {
      user_id: string;
      plan: string | ValidPackageType;
      daily_limit: number | null;
      monthly_limit: number | null;
      used_today: number | null;
      used_monthly: number | null;
      limit_reset_at: string | null;
      monthly_reset_at: string | null;
      active: boolean | null;
      created_at: string | null;
      updated_at: string | null;
    };

export async function updateUserLimits(
  supabase: SupabaseClient<Database>,
  plan: ValidPackageType,
  userId?: string,
  opts?: UpdateUserLimitsOptions
) {
  const resetMode: LimitsResetMode = opts?.reset ?? 'none';
  if (resetMode !== 'none') {
    console.warn(
      'updateUserLimits: параметр `reset` больше не поддерживается и будет проигнорирован. Сбросы выполняются только reset-роутами.'
    );
  }

  if (!userId) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Failed to get user:', authError?.message);
      return;
    }
    userId = user.id;
  }

  const planLimits = PACKAGE_LIMITS[plan];
  const now = new Date().toISOString();

  const { data: existing, error: readErr } = await supabase
    .from('user_limits')
    .select(
      [
        'user_id',
        'plan',
        'daily_limit',
        'monthly_limit',
        'used_today',
        'used_monthly',
        'limit_reset_at',
        'monthly_reset_at',
        'active',
        'created_at',
        'updated_at',
      ].join(', ')
    )
    .eq('user_id', userId)
    .maybeSingle<UserLimitsRow>();

  if (readErr) {
    console.error('⚠️ Failed to fetch user_limits (proceeding with insert/update):', readErr);
  }

  const quotasPayload = {
    plan,
    daily_limit: planLimits.dailyGenerations,
    monthly_limit: planLimits.requestsPerMonth,
    updated_at: now,
  } as const;

  if (!existing) {
    const insertPayload = {
      user_id: userId,
      plan,
      daily_limit: planLimits.dailyGenerations,
      monthly_limit: planLimits.requestsPerMonth,
      created_at: now,
      updated_at: now,
    } as Partial<UserLimitsRow> & { user_id: string; plan: string };

    const { error: insertErr } = await supabase.from('user_limits').insert(insertPayload as any);
    if (insertErr) {
      console.error('❌ Failed to insert user_limits:', insertErr);
    } else {
      console.log(
        `✅ user_limits inserted for ${userId} plan=${plan} (quotas-only) reason=${opts?.reason ?? 'n/a'}`
      );
    }
    return;
  }

  const { error: updateErr } = await supabase
    .from('user_limits')
    .update(quotasPayload as Partial<UserLimitsRow>)
    .eq('user_id', userId);

  if (updateErr) {
    console.error('❌ Failed to update user_limits:', updateErr);
  } else {
    console.log(
      `✅ user_limits updated for ${userId} plan=${plan} (quotas-only) reason=${opts?.reason ?? 'n/a'}`
    );
  }
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/app/context/AuthProvider';
import { logUserAction } from '@/lib/supabase/logUserAction';
import {
  Device,
  getOnboardingWSFlags,
  setOnboardingWSFlags,
  lsKey,
  WSFlags,
} from '@/lib/supabase/profileFlagsWorkspace';

function detectDevice(): Device {
  if (typeof window === 'undefined') return 'desktop';
  const isCoarse = window.matchMedia?.('(pointer: coarse)')?.matches;
  const ua = navigator.userAgent || '';
  const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua);
  return isCoarse || isMobileUA ? 'mobile' : 'desktop';
}

export function useOnboardingWorkspace() {
  const { session, user, supabase } = useAuth();
  const device = useMemo(detectDevice, []);
  const [ready, setReady] = useState(false);

  const [v, setV] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    firstImageDrag: false,
    step6: false,
  });

  const flagsRef = useRef<WSFlags>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    firstImageDrag: false,
    step6: false,
  });

  useEffect(() => {
    (async () => {
      if (!session || !user) {
        setReady(true);
        return;
      }

      if (device === 'mobile') {
        setReady(true);
        return;
      }

      const ls = (k: keyof WSFlags) => localStorage.getItem(lsKey(user.id, device, k)) === 'true';
      let f: WSFlags = {
        step1: ls('step1'),
        step2: ls('step2'),
        step3: ls('step3'),
        step4: ls('step4'),
        firstImageDrag: ls('firstImageDrag'),
        step6: ls('step6'),
      };

      try {
        const db = await getOnboardingWSFlags(supabase, user.id, device);
        f = db;
        (Object.keys(db) as (keyof WSFlags)[]).forEach((k) => {
          if (db[k]) localStorage.setItem(lsKey(user.id, device, k), 'true');
        });
      } catch {
      } finally {
        flagsRef.current = f;
        if (!f.step1) {
          setV((s) => ({ ...s, step1: true }));
          await log('onboarding_workspace_step1_shown');
        } else if (!f.step2) {
          setV((s) => ({ ...s, step2: true }));
          await log('onboarding_workspace_step2_shown');
        }
        setReady(true);
      }
    })();
  }, [session, user, supabase, device]);

  async function persist(partial: Partial<WSFlags>) {
    if (!session || !user || device === 'mobile') return;
    Object.entries(partial).forEach(([k, v]) => {
      if (v) localStorage.setItem(lsKey(user.id, device, k as keyof WSFlags), 'true');
    });
    await setOnboardingWSFlags(supabase, user.id, device, partial);
    flagsRef.current = { ...flagsRef.current, ...partial };
  }

  async function log(name: string, extra: Record<string, any> = {}) {
    if (!session || !user || device === 'mobile') return;
    await logUserAction(supabase, user.id, name, { device, path: '/workspace', ...extra });
  }

  const acceptStep1 = async () => {
    if (device === 'mobile') return;
    await persist({ step1: true });
    setV((s) => ({ ...s, step1: false }));
    await log('onboarding_workspace_step1_accepted');
    if (!flagsRef.current.step2) {
      setV((s) => ({ ...s, step2: true }));
      await log('onboarding_workspace_step2_shown');
    }
  };
  const dismissStep1 = async () => {
    if (device === 'mobile') return;
    setV((s) => ({ ...s, step1: false }));
    await log('onboarding_workspace_step1_dismissed');
  };

  const acceptStep2 = async () => {
    if (device === 'mobile') return;
    await persist({ step2: true });
    setV((s) => ({ ...s, step2: false }));
    await log('onboarding_workspace_step2_accepted');
  };
  const dismissStep2 = async () => {
    if (device === 'mobile') return;
    setV((s) => ({ ...s, step2: false }));
    await log('onboarding_workspace_step2_dismissed');
  };

  const acceptStep3 = async () => {
    if (device === 'mobile') return;
    await persist({ step3: true });
    setV((s) => ({ ...s, step3: false }));
    await log('onboarding_workspace_step3_accepted');
  };
  const dismissStep3 = async () => {
    if (device === 'mobile') return;
    setV((s) => ({ ...s, step3: false }));
    await log('onboarding_workspace_step3_dismissed');
  };

  const acceptStep4 = async () => {
    if (device === 'mobile') return;
    await persist({ step4: true });
    setV((s) => ({ ...s, step4: false }));
    await log('onboarding_workspace_step4_accepted');
  };
  const dismissStep4 = async () => {
    if (device === 'mobile') return;
    setV((s) => ({ ...s, step4: false }));
    await log('onboarding_workspace_step4_dismissed');
  };

  const acceptFirstImageDrag = async () => {
    if (device === 'mobile') return;
    await persist({ firstImageDrag: true });
    setV((s) => ({ ...s, firstImageDrag: false }));
    await log('onboarding_workspace_first_image_drag_accepted');
  };
  const laterFirstImageDrag = async () => {
    if (device === 'mobile') return;
    await persist({ firstImageDrag: true });
    setV((s) => ({ ...s, firstImageDrag: false }));
    await log('onboarding_workspace_first_image_drag_later');
  };

  const acceptStep6 = async () => {
    if (device === 'mobile') return;
    await persist({ step6: true });
    setV((s) => ({ ...s, step6: false }));
    await log('onboarding_workspace_cdrs_accepted');
  };

  const triggerFirstAssistantReply = async () => {
    if (device === 'mobile') return;
    if (!flagsRef.current.step3 && !v.step3) {
      setV((s) => ({ ...s, step3: true }));
      await log('onboarding_workspace_step3_shown');
    }
  };
  const triggerSaveModalOpened = async () => {
    if (device === 'mobile') return;
    if (!flagsRef.current.step4 && !v.step4) {
      setV((s) => ({ ...s, step4: true }));
      await log('onboarding_workspace_step4_shown');
    }
  };
  const triggerFirstImage = async () => {
    if (device === 'mobile') return;
    if (!flagsRef.current.firstImageDrag && !v.firstImageDrag) {
      setV((s) => ({ ...s, firstImageDrag: true }));
      await log('onboarding_workspace_first_image_drag_shown');
    }
  };
  const triggerCdrsEnabled = async () => {
    if (device === 'mobile') return;
    if (!flagsRef.current.step6 && !v.step6) {
      setV((s) => ({ ...s, step6: true }));
      await log('onboarding_workspace_cdrs_shown');
    }
  };

  return {
    device,
    ready,

    showStep1: device === 'mobile' ? false : v.step1,
    showStep2: device === 'mobile' ? false : v.step2,
    showStep3: device === 'mobile' ? false : v.step3,
    showStep4: device === 'mobile' ? false : v.step4,
    showFirstImageDrag: device === 'mobile' ? false : v.firstImageDrag,
    showStep6: device === 'mobile' ? false : v.step6,

    acceptStep1,
    dismissStep1,
    acceptStep2,
    dismissStep2,
    acceptStep3,
    dismissStep3,
    acceptStep4,
    dismissStep4,
    acceptFirstImageDrag,
    laterFirstImageDrag,
    acceptStep6,
    dismissStep6: () => {
      if (device === 'mobile') return;
      setV((s) => ({ ...s, step6: false }));
    },

    triggerFirstAssistantReply,
    triggerSaveModalOpened,
    triggerFirstImage,
    triggerCdrsEnabled,
  };
}

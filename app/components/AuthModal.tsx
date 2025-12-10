'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { getRedirectTo } from '@/utils/getRedirectTo';
import GlobalLoading from '@/app/loading';
import type { AuthApiError } from '@supabase/supabase-js';
import { useSearchParams } from 'next/navigation';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const shellRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  const [mobileNoteOpen, setMobileNoteOpen] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const isTouch =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches === true;
    setIsMobile(isTouch);

    if (!isTouch) {
      setTimeout(() => emailRef.current?.focus(), 0);
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        onClose();
        let redirectTo: string;
        if (window.location.pathname === '/' || window.location.pathname === '/login') {
          redirectTo = '/workspace';
        } else {
          redirectTo = window.location.pathname;
        }

        router.push(redirectTo);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        onClose();
        let redirectTo: string;
        if (window.location.pathname === '/' || window.location.pathname === '/login') {
          redirectTo = '/workspace';
        } else {
          redirectTo = window.location.pathname;
        }
        router.push(redirectTo);
      }
    });
    unsub = data.subscription;

    return () => unsub?.unsubscribe();
  }, [supabase, onClose, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (searchParams?.get('unverified') === '1') {
      setNeedsVerification(true);
      setInfo('Your email is not verified yet. You can resend the verification email below.');
    }
  }, []);

  useEffect(() => {
    if (searchParams?.get('verified') === '1') {
      setInfo('Email verified. You can log in now.');
    }
  }, []);

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === shellRef.current) onClose();
  };

  const handleGoogleLogin = async () => {
    setError('');
    if (!agree) {
      setError('You must agree to the Terms to continue.');
      return;
    }

    setRedirecting(true);
    localStorage.setItem('agreed_to_terms', 'true');

    requestAnimationFrame(async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getRedirectTo(), queryParams: { prompt: 'select_account' } },
      });
      if (error) {
        setRedirecting(false);
        setError(error.message);
      }
    });
  };

  function isEmailNotConfirmed(err: unknown) {
    const status = (err as AuthApiError | undefined)?.status;
    const msg = (err as any)?.message?.toString()?.toLowerCase?.() ?? '';
    return status === 400 && msg.includes('confirm');
  }

  async function resendSignupEmail() {
    setError('');
    setInfo('');
    if (!email) {
      setError('Enter your email to resend verification.');
      return;
    }
    if (resendCooldown > 0 || resendLoading) return;

    try {
      setResendLoading(true);
      const { error: rErr } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (rErr) {
        setError(rErr.message);
        return;
      }
      setResendSent(true);
      setInfo('Verification email sent. Check your inbox.');
      setResendCooldown(60);
    } finally {
      setResendLoading(false);
    }
  }

  const handleAuth = async () => {
    try {
      sessionStorage.setItem('loginRedirectTo', window.location.pathname);
    } catch {}
    setError('');
    setInfo('');
    if (!agree) {
      setError('You must agree to the Terms to continue.');
      return;
    }
    if (!email || !password) {
      if (!isLogin && isMobile) {
        setMobileNoteOpen(true);
        return;
      }
      setError('Email and password are required.');
      return;
    }

    if (!isLogin && isMobile) {
      setMobileNoteOpen(true);
      return;
    }

    if (isLogin) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        if (isEmailNotConfirmed(signInErr)) {
          setNeedsVerification(true);
          setError('');
          setInfo('Your email is not verified yet. You can resend the verification email below.');
        } else {
          setError(signInErr.message);
        }
      } else {
        onClose();
        const redirectTo = sessionStorage.getItem('loginRedirectTo');
        sessionStorage.removeItem('loginRedirectTo');
        router.push(
          !redirectTo || redirectTo === '/' || redirectTo === '/login' ? '/workspace' : redirectTo
        );
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else {
        localStorage.setItem('agreed_to_terms', 'true');
        setInfo('Check your email to confirm your registration.');
        setNeedsVerification(true);
      }
    }
  };

  if (redirecting) {
    return (
      <div data-interactive="true" className="fixed inset-0 z-[9999]">
        <GlobalLoading />
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      onMouseDown={onBackdrop}
      data-interactive="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div className="pointer-events-none absolute inset-0 mx-auto max-w-md h-[360px] top-1/2 -translate-y-1/2 bg-purple-500/10 blur-3xl rounded-[48px]" />

      <div
        ref={dialogRef}
        className="relative w-[92%] max-w-md max-h-[90vh] overflow-y-auto
                   rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur
                   shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-6 sm:p-7 text-white"
      >
        <div className="flex items-start justify-between">
          <h2 id="auth-title" className="text-lg font-semibold tracking-tight">
            Welcome to H1NTED
          </h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-white/70 hover:text-white
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="mt-5 w-full inline-flex items-center justify-center gap-3
                     rounded-xl px-4 py-3 bg-white/[0.08] hover:bg-white/[0.12]
                     ring-1 ring-white/15 text-white
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60"
        >
          <FcGoogle className="text-xl" />
          Continue with Google
        </button>

        <div className="my-5 text-center text-xs text-white/50">
          or enter your email and password
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAuth();
          }}
          className="space-y-3"
        >
          <input
            ref={emailRef}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-white/[0.06] ring-1 ring-white/10
                       px-4 py-3 text-base sm:text-sm placeholder-white/50
                       focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-white/[0.06] ring-1 ring-white/10
                       px-4 py-3 text-base sm:text-sm placeholder-white/50
                       focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          />

          <label className="mt-1.5 flex items-start gap-3 text-xs text-white/70">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              className="mt-0.5 h-4 w-4 rounded border-white/30 bg-transparent
                         text-purple-400 focus:ring-purple-300/60"
            />
            <span className="leading-tight">
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                className="underline decoration-purple-300/40 underline-offset-4 hover:text-white"
              >
                Terms of Use
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                target="_blank"
                className="underline decoration-purple-300/40 underline-offset-4 hover:text-white"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>

          {error && <div className="text-red-300 text-xs">{error}</div>}
          {info && <div className="text-green-300 text-xs">{info}</div>}

          {(needsVerification || (isLogin && email)) && (
            <div className="mt-3 rounded-lg bg-white/[0.05] ring-1 ring-white/10 p-3">
              <div className="text-xs text-white/80">
                Didn’t get the email? You can resend the verification link.
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={resendSignupEmail}
                  disabled={resendLoading || resendCooldown > 0}
                  className="rounded-md px-3 py-1.5 text-xs bg-white/10 hover:bg-white/15 ring-1 ring-white/15 disabled:opacity-60"
                >
                  {resendLoading
                    ? 'Sending…'
                    : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend verification email'}
                </button>
                {resendSent && <span className="text-[11px] text-green-300">Sent</span>}
              </div>
            </div>
          )}

          <div className="relative">
            <button
              type="submit"
              disabled={(!email || !password) && !(isMobile && !isLogin)}
              aria-describedby={mobileNoteOpen ? 'mobile-signup-note' : undefined}
              className={
                `mt-4 w-full rounded-full px-5 py-3 text-white backdrop-blur ring-1 focus:outline-none
                 focus-visible:ring-2 focus-visible:ring-purple-300/60 ` +
                (!isLogin && isMobile
                  ? 'bg-white/5 ring-white/10 text-white/60 opacity-50 hover:bg-white/5 hover:ring-white/10'
                  : 'bg-purple-500/25 hover:bg-purple-500/30 ring-purple-300/30 hover:ring-purple-300/40 ' +
                    'md:bg-purple-500/20 md:hover:bg-purple-500/30 md:ring-purple-300/30 md:hover:ring-purple-300/50 disabled:opacity-60')
              }
            >
              {isLogin ? 'Login' : 'Create Account'}
            </button>

            {mobileNoteOpen && (
              <div
                id="mobile-signup-note"
                role="dialog"
                aria-live="polite"
                className="absolute left-1/2 -translate-x-1/2 bottom-[52px]
                           w-[240px] rounded-xl bg-black/80 text-white text-xs
                           ring-1 ring-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.4)]
                           p-3 z-10"
              >
                <button
                  type="button"
                  onClick={() => setMobileNoteOpen(false)}
                  aria-label="Close"
                  className="absolute top-1 right-1 px-2 py-1 text-white/60 hover:text-white"
                >
                  ✕
                </button>
                <div className="flex items-start gap-2 pr-6">
                  <div className="mt-[2px]">⚠️</div>
                  <div className="leading-snug">
                    Email sign-up unavailable on mobile. Try Google instead.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="mt-2 w-full rounded-lg px-3 py-1.5 text-xs
                             bg-white/10 hover:bg-white/15 ring-1 ring-white/15"
                >
                  Continue with Google
                </button>
                <div
                  className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0
                                border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black/80"
                />
              </div>
            )}
          </div>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            onClick={() => {
              const next = !isLogin;
              setIsLogin(next);
              if (next === false && isMobile) {
                setMobileNoteOpen(true);
              } else {
                setMobileNoteOpen(false);
              }
            }}
            className="text-purple-300 hover:text-purple-200 underline underline-offset-4 decoration-purple-300/40"
          >
            {isLogin ? 'Create an account' : 'Already have an account? Log in'}
          </button>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60 rounded-md px-2 py-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import Image from 'next/image';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { PACKAGE_TO_PRICE } from '@/types/plan';

interface LimitModalProps {
  show: boolean;
  onClose: () => void;
  sidebarOffset?: number;
}

const ACCENT = 'currentColor';

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`h-4 w-4 flex-none mt-[2px] text-[var(--text-secondary)] ${className}`}
    >
      <path d="M5 12l4 4 10-10" stroke={ACCENT} strokeWidth="2" />
    </svg>
  );
}

export default function LimitModal({ show, onClose, sidebarOffset = 0 }: LimitModalProps) {
  const [expanded, setExpanded] = useState(false);
  const supabase = createPagesBrowserClient();

  const handleCheckout = async (plan: 'Premium' | 'Business') => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const priceId = PACKAGE_TO_PRICE[plan];

      if (!priceId) {
        throw new Error(`Missing Stripe priceId for plan: ${plan}`);
      }

      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ priceId }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Stripe checkout failed (${res.status}): ${errorText}`);
      }

      const { url } = await res.json();
      if (!url) throw new Error('Missing Stripe redirect URL');
      window.location.href = url;
    } catch (error) {
      console.error('❌ Stripe Checkout Error:', error);
      alert('Something went wrong with Stripe checkout. Please try again later.');
    }
  };

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setExpanded(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setExpanded(false);
    }
  }, [show]);

  if (!show) return null;

  const buttonClasses = 'text-xs px-5 py-2 rounded-xl min-w-[120px] text-center';

  return (
    <div
      className="fixed w-full flex justify-center px-2 sm:px-4 z-50 pointer-events-none"
      style={{
        left: sidebarOffset,
        width: `calc(100% - ${sidebarOffset}px)`,
        bottom: 'calc(145px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={expanded ? 'expanded' : 'compact'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="
            group
            relative
            w-full max-w-2xl
            pointer-events-auto
            rounded-3xl
            bg-[var(--background)]/90
            border border-[var(--card-border)]
            shadow-2xl
            overflow-hidden
            text-[var(--text-primary)]
          "
        >
          {/* Background image */}
          <Image
            src="/images/plan-limit.png"
            alt="Plan limit"
            fill
            priority={false}
            className="object-cover"
          />
          {/* Theme-adaptive overlay for readability */}
          <div className="absolute inset-0 bg-[var(--background)]/80" />

          {!expanded ? (
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 text-[11px] font-monoBrand tracking-[0.14em] uppercase">
              <span className="whitespace-normal md:whitespace-nowrap text-center md:text-left">
                You've reached the plan limit:
              </span>

              {/* ✅ MOBILE ONLY: 2 CTA in one row + small expand button below */}
              <div className="md:hidden flex flex-col gap-2 w-full">
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => handleCheckout('Premium')}
                    className="
                      flex-1
                      rounded-full
                      border border-[var(--card-border)]
                      bg-[var(--background)]
                      text-[var(--text-secondary)]
                      hover:bg-[var(--surface)]
                      transition
                      px-3 py-2
                      font-monoBrand tracking-[0.14em] uppercase text-[11px]
                    "
                  >
                    Go Premium
                  </button>

                  <button
                    onClick={() => handleCheckout('Business')}
                    className="
                      flex-1
                      rounded-full
                      border border-[var(--card-border)]
                      bg-[var(--background)]
                      text-[var(--text-secondary)]
                      hover:bg-[var(--surface)]
                      transition
                      px-3 py-2
                      font-monoBrand tracking-[0.14em] uppercase text-[11px]
                    "
                  >
                    Go Business
                  </button>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setExpanded(true)}
                    className="
                      inline-flex items-center justify-center
                      h-9 w-9
                      rounded-full
                      bg-[var(--background)]
                      border border-[var(--card-border)]
                      text-[var(--text-secondary)]
                      transition
                      hover:bg-[var(--surface)]
                    "
                    aria-label="Expand"
                  >
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>

              {/* ✅ DESKTOP (md+) — оставлено как было */}
              <div className="hidden md:flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
                <button
                  onClick={() => handleCheckout('Premium')}
                  className="
                    rounded-full
                    border border-[var(--card-border)]
                    bg-[var(--background)]
                    text-[var(--text-secondary)]
                    hover:bg-[var(--surface)]
                    transition
                    px-3 py-1
                    w-full md:w-auto min-w-[95px]
                    font-monoBrand tracking-[0.14em] uppercase text-[11px]
                  "
                >
                  Go Premium
                </button>

                <button
                  onClick={() => handleCheckout('Business')}
                  className="
                    rounded-full
                    border border-[var(--card-border)]
                    bg-[var(--background)]
                    text-[var(--text-secondary)]
                    hover:bg-[var(--surface)]
                    transition
                    px-3 py-1
                    w-full md:w-auto min-w-[95px]
                    font-monoBrand tracking-[0.14em] uppercase text-[11px]
                  "
                >
                  Upgrade to Business
                </button>

                {/* Expand arrow stays in compact */}
                <button
                  onClick={() => setExpanded(true)}
                  className="
                    inline-flex items-center justify-center
                    h-9 w-full md:w-9
                    rounded-full
                    bg-[var(--background)]
                    border border-[var(--card-border)]
                    text-[var(--text-secondary)]
                    transition
                    hover:bg-[var(--surface)]
                  "
                  aria-label="Expand"
                >
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="
                relative
                px-4 pt-2 pb-4 sm:px-6 sm:pt-2 sm:pb-5
                overflow-y-auto md:overflow-visible
                max-h-[min(65svh,calc(100vh-200px))] md:max-h-none
              "
            >
              {/* Top-right close (appears on hover like banners) */}
              <div className="sticky top-0 z-10">
                <div className="flex justify-end pl-4 pr-2 sm:pl-6 sm:pr-4 pt-1">
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    aria-label="Close"
                    className="
                      inline-flex items-center justify-center
                      h-7 w-7
                      rounded-full
                      bg-[var(--background)]
                      border border-[var(--card-border)]
                      text-[var(--text-secondary)]
                      opacity-0 group-hover:opacity-100
                      transition
                      hover:bg-[var(--surface)]
                    "
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* --- Plans --- */}
              <div
                className="
                  mt-2
                  flex flex-col
                  md:flex-row md:items-stretch
                  rounded-3xl
                  overflow-hidden
                  border border-[var(--card-border)]
                  bg-[var(--background)]/60
                "
              >
                {/* Premium */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-center">Premium</h3>
                    <div className="text-2xl font-semibold mt-2 text-center">
                      €49 <span className="text-sm text-[var(--text-secondary)]">/ month</span>
                    </div>
                    <p className="text-center text-sm text-[var(--text-secondary)] mt-2">
                      Diplomacy-grade Signal Reader. Personal Use
                    </p>

                    <p className="text-center text-xs text-[var(--text-secondary)]/80 mt-3 mb-3">
                      Everything in Freemium, plus:
                    </p>

                    <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>25 Pattern Recognitions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>Enhanced Work Tools</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>Knowledge Library</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleCheckout('Premium')}
                    className={`
                      bg-[var(--background)]
                      hover:bg-[var(--surface)]
                      text-[var(--text-secondary)]
                      ${buttonClasses}
                      w-full mt-5 rounded-full border border-[var(--card-border)] transition
                    `}
                  >
                    Upgrade to Premium
                  </button>
                </div>

                {/* Divider for desktop */}
                <div className="hidden md:block w-px bg-[var(--card-border)]" />

                {/* Business */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-center">Business</h3>
                    <div className="text-2xl font-semibold mt-2 text-center">
                      €199 <span className="text-sm text-[var(--text-secondary)]">/ month</span>
                    </div>
                    <p className="text-center text-sm text-[var(--text-secondary)] mt-2">
                      For Teams & Enterprises to Scale Up Faster
                    </p>

                    <p className="text-center text-xs text-[var(--text-secondary)]/80 mt-3 mb-3">
                      Everything in Premium, plus:
                    </p>

                    <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>Unlimited Pattern Recognitions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>Enhanced Insight Syntheses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>Onboarding on Request</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>Discounted Workshops</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleCheckout('Business')}
                    className={`
                      bg-[var(--background)]
                      hover:bg-[var(--surface)]
                      text-[var(--text-secondary)]
                      ${buttonClasses}
                      w-full mt-5 rounded-full border border-[var(--card-border)] transition
                    `}
                  >
                    Upgrade to Business
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <button onClick={onClose} className="hidden" aria-hidden="true" />
    </div>
  );
}

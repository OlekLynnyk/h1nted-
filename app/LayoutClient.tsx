'use client';

import { useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from './context/AuthProvider';
import { SidebarProvider } from './context/SidebarContext';
import CookieBanner from '@/components/CookieBanner';
import SessionBridge from '@/components/SessionBridge';
import { applyConsentToPage, attachConsentListener } from '@/utils/consent';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  useCookieConsent();
  useEffect(() => {
    applyConsentToPage();
    attachConsentListener();
  }, []);

  const pathname = usePathname();
  const isWorkspace = pathname?.startsWith('/workspace');

  return (
    <SidebarProvider>
      <AuthProvider>
        <Suspense fallback={null}>
          <SessionBridge />
        </Suspense>
        {children}
        <CookieBanner />
      </AuthProvider>
    </SidebarProvider>
  );
}

function useCookieConsent() {
  useEffect(() => {
    const hasCMPStubs =
      typeof document !== 'undefined' &&
      document.querySelector('script[type="text/plain"][data-consent]');

    if (hasCMPStubs) {
      return;
    }

    let consent: string | null = null;
    try {
      consent = localStorage.getItem('cookieConsent');
    } catch {
      consent = null;
    }

    if (consent === 'accepted') {
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
          (window as any).dataLayer.push(args);
        }
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXX');
      };
    }
  }, []);
}

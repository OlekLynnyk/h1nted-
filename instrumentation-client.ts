import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://f457f6ee647f116882ad7a1d34832289@o4509849499926528.ingest.de.sentry.io/4509849503006800',

  integrations: [Sentry.replayIntegration()],

  tracesSampleRate: 1,
  enableLogs: true,

  replaysSessionSampleRate: 0.1,

  replaysOnErrorSampleRate: 1.0,

  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

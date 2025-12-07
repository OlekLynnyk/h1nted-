export default function Head() {
  return (
    <>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />
      <meta name="theme-color" content="#0B0E11" media="(prefers-color-scheme: dark)" />
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />

      <link
        rel="preload"
        as="video"
        href="/videos/how-it-works-1080p-h264.mp4"
        type="video/mp4"
        media="(max-width: 1023.98px)"
        crossOrigin="anonymous"
      />

      <script
        type="text/plain"
        data-consent="analytics"
        data-src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX`}
        data-async
      />
      <script
        type="text/plain"
        data-consent="analytics"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXX', { anonymize_ip: true });
          `,
        }}
      />
    </>
  );
}

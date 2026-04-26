import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/shadowbg.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans+Text&display=swap"/>
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              document.documentElement.setAttribute('data-bs-theme', theme);
            })()
          `
        }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
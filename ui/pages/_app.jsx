"use client";

import '../styles/globals.css'
import '../styles/main.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Head from "next/head";
import { useEffect } from 'react';

function ShadowBG({ Component, pageProps }) {
  useEffect(() => {
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', theme);

    const listener = (e) => {
      document.documentElement.setAttribute('data-bs-theme', e.matches ? 'dark' : 'light');
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
  }, []);

  return (<>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>ShadowBG</title>
      <meta name="description" content="ShadowBG" />
    </Head>
    <Component {...pageProps} />
  </>);
}

export default ShadowBG
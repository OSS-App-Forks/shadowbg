"use client";

import '../styles/globals.css'
import '../styles/main.css'
import Head from "next/head";

function ShadowBG({ Component, pageProps }) {
  return (<>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>ShadowBG</title>
      <meta name="description" content="ShadowBG" />
    </Head>
    <div className="amoled-theme">
      <Component {...pageProps} />
    </div>
  </>);
}

export default ShadowBG

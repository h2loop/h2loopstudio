import '@/global.scss'
import '@/globals.css'
import AppLayout from '@/layouts/appLayout'
import { ConfigProvider, theme } from 'antd'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import { Nunito } from 'next/font/google'
import Head from 'next/head'
import {
  BORDER_RADIUS,
  COLOR_DARK_2,
  COLOR_OUTLINE,
  PRIMARY_COLOR,
} from '../constants'

const font = Nunito({ weight: '400', subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={font.className}>
      <Head>
        <title>Herald</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: PRIMARY_COLOR,
            colorInfo: PRIMARY_COLOR,
            colorBgBase: COLOR_DARK_2,
            borderRadius: BORDER_RADIUS,
            controlOutline: COLOR_OUTLINE,
          },
          algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
        }}
      >
        <SessionProvider>
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        </SessionProvider>
      </ConfigProvider>
    </main>
  )
}

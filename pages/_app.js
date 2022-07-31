import Head from 'next/head'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>debate-bro.com</title>
                <meta
                    name="description"
                    content="Easily find someone to debate online! Omegle for politics."></meta>
            </Head>
            <GoogleAnalytics />
            <Component {...pageProps} />
        </>
    )
}

export default MyApp
import Head from 'next/head'
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
            <Component {...pageProps} />
        </>
    )
}

export default MyApp
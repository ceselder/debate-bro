import Head from 'next/head'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                <script src="https://unpkg.com/peerjs@1.3.2/dist/peerjs.min.js"></script>
            </Head>
            <Component {...pageProps} />
        </>
    )
}

export default MyApp
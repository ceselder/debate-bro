import Head from 'next/head'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Component {...pageProps} />
        </>
    )
}

export default MyApp
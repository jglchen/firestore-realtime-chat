import Head from 'next/head';

export default function Layout({ children}: {children: JSX.Element}) {
    return (
        <>
           <Head>
             <title>Chat Applications with Cloud Firestore</title>
             <link rel="icon" href="/favicon.ico" />
           </Head>
           <main>
              {children}
           </main>   
        </>
    );
}


import Head from 'next/head';

export default function Layout({ children}: {children: JSX.Element}) {
    return (
        <>
           <Head>
             <title>Chat Applications with Cloud Firestore</title>
             <link rel="icon" href="/favicon.ico" />
             <meta
              name="description"
              content="A real-time chat application with Firebase Cloud FireStore"
              />
             <meta name="og:title" content="Chat Applications with Cloud Firestore" />
             <meta
              property="og:description"
              content="A real-time chat application with Firebase Cloud FireStore"
              />
           </Head>
           <main>
              {children}
           </main>   
        </>
    );
}



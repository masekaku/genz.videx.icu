import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export async function getServerSideProps() {
  // Fetch video list untuk random selection
  const videos = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/list`)
    .then(res => res.json());
  
  const randomVideo = videos[Math.floor(Math.random() * videos.length)];
  
  return {
    redirect: {
      destination: `/f/${randomVideo.id}`,
      permanent: false,
    },
  };
}

export default function Home() {
  const router = useRouter();
  
  // Fallback client-side redirect
  useEffect(() => {
    const redirectToRandom = async () => {
      try {
        const response = await fetch('/api/list');
        const videos = await response.json();
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        router.push(`/f/${randomVideo.id}`);
      } catch (error) {
        console.error('Redirect failed:', error);
      }
    };

    redirectToRandom();
  }, [router]);

  return (
    <>
      <Head>
        <title>Video Player</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="loading">
        <p>Loading random video...</p>
        <style jsx>{`
          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: black;
            color: white;
          }
        `}</style>
      </div>
    </>
  );
}
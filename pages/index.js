import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export async function getServerSideProps(context) {
  try {
    // 1. Deteksi URL secara dinamis (bisa jalan di localhost maupun Vercel)
    const { req } = context;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // 2. Fetch ke URL yang benar
    const res = await fetch(`${baseUrl}/api/list`);

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }

    const videos = await res.json();

    // Cek jika array kosong
    if (!videos || videos.length === 0) {
      return { props: {} }; // Lanjut ke client-side jika tidak ada video
    }

    const randomVideo = videos[Math.floor(Math.random() * videos.length)];

    return {
      redirect: {
        destination: `/f/${randomVideo.id}`,
        permanent: false,
      },
    };
  } catch (error) {
    console.error('Server-side redirect failed:', error);
    // Jika server error, jangan bikin crash (500).
    // Return props kosong saja, biar 'useEffect' di bawah yang kerja.
    return {
      props: {},
    };
  }
}

export default function Home() {
  const router = useRouter();

  // Fallback client-side redirect
  // (Akan jalan kalau getServerSideProps gagal atau lambat)
  useEffect(() => {
    const redirectToRandom = async () => {
      try {
        const response = await fetch('/api/list');
        if (!response.ok) return;
        
        const videos = await response.json();
        if (videos && videos.length > 0) {
          const randomVideo = videos[Math.floor(Math.random() * videos.length)];
          router.push(`/f/${randomVideo.id}`);
        }
      } catch (error) {
        console.error('Client-side redirect failed:', error);
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
            font-family: sans-serif;
          }
        `}</style>
      </div>
    </>
  );
}

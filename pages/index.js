import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export async function getServerSideProps(context) {
  try {
    // 1. Deteksi URL website secara otomatis (Localhost vs Vercel)
    const { req } = context;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // 2. Panggil API Ringan yang baru (/api/random)
    const res = await fetch(`${baseUrl}/api/random`);
    
    if (!res.ok) {
      throw new Error(`Gagal fetch data: ${res.status}`);
    }

    const videoData = await res.json();

    // 3. Jika dapat data, langsung redirect dari Server (Cepat)
    if (videoData && videoData.id) {
      return {
        redirect: {
          destination: `/f/${videoData.id}`,
          permanent: false,
        },
      };
    }

    // Jika data kosong
    return { props: {} };

  } catch (error) {
    console.error('Server-side Error:', error);
    // Jangan crash (Error 500), biarkan lanjut ke client-side loading
    return {
      props: {},
    };
  }
}

export default function Home() {
  const router = useRouter();

  // Fallback: Jika server gagal redirect, Browser yang akan mencoba
  useEffect(() => {
    const fetchRandomClient = async () => {
      try {
        const res = await fetch('/api/random'); // Panggil API yang ringan
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            router.push(`/f/${data.id}`);
          }
        }
      } catch (error) {
        console.error('Client redirect failed:', error);
      }
    };

    fetchRandomClient();
  }, [router]);

  return (
    <>
      <Head>
        <title>Video Player</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <script type='text/javascript' src='//workplacecakefaculty.com/5d/39/9f/5d399fd213e3a5400b25f84cc681b432.js'></script>
      </Head>
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Memuat video...</p>
        
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #000;
            color: #fff;
            font-family: sans-serif;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid #fff;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}

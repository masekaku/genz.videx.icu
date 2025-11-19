import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

export default function VideoPlayerPage() {
  const router = useRouter();
  const { videoID } = router.query;
  const videoRef = useRef(null);
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Video Data
  useEffect(() => {
    if (!videoID) return;

    const fetchVideoData = async () => {
      try {
        // Pastikan API ini sesuai dengan struktur kamu
        // Jika kamu pakai JSON generator tadi, pastikan endpoint ini mencari ID yang benar
        const response = await fetch(`/api/videos?videoID=${videoID}`);
        
        if (!response.ok) throw new Error("Gagal mengambil data");
        
        const data = await response.json();
        setVideoData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching video data:', error);
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [videoID]);

  // 2. Setup Autoplay & Events
  useEffect(() => {
    if (!videoData || !videoRef.current) return;

    const videoElement = videoRef.current;

    const setupVideo = async () => {
      try {
        // Usahakan play, biasanya browser butuh muted=true untuk autoplay pertama kali
        // Tapi kita coba play langsung dulu
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              trackHistatsEvent('play');
            })
            .catch((error) => {
              console.log('Autoplay prevented by browser (User interaction needed):', error);
              // Fallback: Tunggu user tap layar baru play
              const playOnInteraction = () => {
                videoElement.play();
                trackHistatsEvent('play_interaction');
                ['click', 'touchstart'].forEach(evt => 
                  document.removeEventListener(evt, playOnInteraction)
                );
              };
              ['click', 'touchstart'].forEach(evt => 
                document.addEventListener(evt, playOnInteraction)
              );
            });
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Logika Double Tap untuk Pause/Play
    let lastTap = 0;
    const handleTouchEnd = (event) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      // Jika tap 2x dalam waktu 300ms
      if (tapLength < 300 && tapLength > 0) {
        event.preventDefault(); // Mencegah zoom default browser
        if (videoElement.paused) {
          videoElement.play();
        } else {
          videoElement.pause();
        }
      }
      lastTap = currentTime;
    };

    videoElement.addEventListener('touchend', handleTouchEnd);
    setupVideo();

    return () => {
      videoElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [videoData]);

  const trackHistatsEvent = (action) => {
    if (typeof window !== 'undefined' && window._Hasync && videoID) {
      try {
        window._Hasync.push(['_trackEvent', 'video', action, videoID]);
      } catch (error) {
        console.error('Histats tracking error:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <style jsx>{`
          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: black;
            color: white;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid #fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="error">
        <p>Video tidak ditemukan.</p>
        <style jsx>{`
          .error { display: flex; justify-content: center; align-items: center; height: 100vh; background: black; color: white; }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Video Player</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        
        {/* Histats Code - JANGAN LUPA GANTI ID 12345 DENGAN ID ASLI KAMU */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var _Hasync= _Hasync|| [];
              _Hasync.push(['Histats.start', '1,12345,10,0,0,0,00010000']);
              _Hasync.push(['Histats.fasi', '1']);
              _Hasync.push(['Histats.track_hits', '']);
              (function() {
                var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;
                hs.src = ('//s10.histats.com/js15_as.js');
                (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
              })();
            `,
          }}
        />
      </Head>

      {/* Global Styles untuk Reset Margin Browser */}
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background-color: #000;
          overflow: hidden; /* Mencegah scroll */
        }
      `}</style>

      <div className="player-container">
        <video
          ref={videoRef}
          src={videoData.source} // Pastikan JSON kamu pakai key 'source'
          className="video-player"
          controlsList="nodownload" // Opsional: menyembunyikan tombol download
          controls // Tampilkan kontrol bawaan (bisa dihapus jika ingin full gesture)
          playsInline
          webkit-playsinline="true"
          loop // Agar video mengulang terus
          // muted // Aktifkan ini jika ingin autoplay 100% jalan tanpa interaksi user
        />

        <style jsx>{`
          .player-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100dvh; /* Dynamic Viewport Height (Penting untuk Mobile) */
            background: black;
            z-index: 1;
            overflow: hidden;
          }
          
          .video-player {
            width: 100%;
            height: 100%;
            object-fit: cover; /* INI YANG BIKIN FULL SCREEN TANPA GAP */
            display: block;
          }
        `}</style>
      </div>
    </>
  );
}

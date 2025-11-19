import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

export default function VideoPlayerPage() {
  const router = useRouter();
  const { videoID } = router.query;
  const videoRef = useRef(null);
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoID) return;

    const fetchVideoData = async () => {
      try {
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

  useEffect(() => {
    if (!videoData || !videoRef.current) return;

    const videoElement = videoRef.current;

    const setupVideo = async () => {
      try {
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              trackHistatsEvent('play');
            })
            .catch((error) => {
              console.log('Autoplay prevented:', error);
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

    let lastTap = 0;
    const handleTouchEnd = (event) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 300 && tapLength > 0) {
        event.preventDefault();
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
        
        {/* KODE IKLAN ADSTERRA (Hapus baris ini jika belum ada linknya) */}
        {/* <script type="text/javascript" src="//pl12345.adsterra.com/zone.js"></script> */}

        {/* Histats Code - Pastikan ID sesuai */}
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

      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background-color: #000;
          overflow: hidden;
        }
      `}</style>

      <div className="player-container">
        <video
          ref={videoRef}
          src={videoData.source}
          className="video-player"
          controlsList="nodownload"
          controls
          playsInline
          webkit-playsinline="true"
          loop
        />

        <style jsx>{`
          .player-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100dvh;
            background: black;
            z-index: 1;
            overflow: hidden;
          }
          
          .video-player {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
        `}</style>
      </div>
    </>
  );
}

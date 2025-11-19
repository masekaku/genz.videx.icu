import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

export default function VideoPlayerPage() {
  const router = useRouter();
  const { videoID } = router.query;
  const videoRef = useRef(null);
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch video data
  useEffect(() => {
    if (!videoID) return;

    const fetchVideoData = async () => {
      try {
        const response = await fetch(`/api/videos?videoID=${videoID}`);
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

  // Setup video autoplay and event listeners
  useEffect(() => {
    if (!videoData || !videoRef.current) return;

    const videoElement = videoRef.current;

    const setupVideo = async () => {
      try {
        await videoElement.play();
        trackHistatsEvent('play');
      } catch (error) {
        console.log('Autoplay prevented:', error);

        // Fallback dengan user interaction
        const playOnInteraction = () => {
          videoElement.play();
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
        };

        document.addEventListener('click', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
      }
    };

    // Double-tap untuk play/pause di mobile
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

    // Track play events
    const handlePlay = () => {
      trackHistatsEvent('play');
    };

    videoElement.addEventListener('touchend', handleTouchEnd);
    videoElement.addEventListener('play', handlePlay);

    setupVideo();

    return () => {
      videoElement.removeEventListener('touchend', handleTouchEnd);
      videoElement.removeEventListener('play', handlePlay);
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
        <p>Loading video...</p>
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
    );
  }

  if (!videoData) {
    return (
      <div className="error">
        <p>Video not found</p>
        <style jsx>{`
          .error {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: black;
            color: white;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Video Player - {videoID}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Histats Analytics */}
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

      <div className="player-container">
        <video
          ref={videoRef}
          src={videoData.source}
          className="video-player"
          controls
          playsInline
          webkit-playsinline="true"
        />

        <style jsx>{`
          .player-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: black;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            padding: 0;
          }
          
          .video-player {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          @media (orientation: portrait) {
            .video-player {
              width: 100%;
              height: auto;
            }
          }
          
          @media (orientation: landscape) {
            .video-player {
              width: auto;
              height: 100%;
            }
          }
        `}</style>
      </div>
    </>
  );
}
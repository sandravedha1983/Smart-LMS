import { useEffect, useRef } from 'react';

/**
 * GlobalVideoBackground
 * Renders a fixed, full-screen video behind all content.
 * Uses preload="none" + lazy autoplay for performance.
 * Pauses when the tab is hidden to save battery.
 */
export default function GlobalVideoBackground({ src = '/hero-video.mp4', opacity = 1 }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <div className="video-bg-wrapper" aria-hidden="true" style={{ opacity }}>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="video-bg-overlay" />
    </div>
  );
}

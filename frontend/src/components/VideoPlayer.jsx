import ReactPlayer from 'react-player';
import { useRef, useEffect } from 'react';

export default function VideoPlayer({ url, thumbnail, onProgress, onDuration, onEnded, seekToTime }) {
  const playerRef = useRef(null);

  useEffect(() => {
    if (seekToTime !== null && seekToTime !== undefined && playerRef.current) {
      const secs = typeof seekToTime === 'object' ? seekToTime.seconds : seekToTime;
      playerRef.current.seekTo(secs, 'seconds');
    }
  }, [seekToTime]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-soft">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        controls
        light={thumbnail || false}
        onProgress={onProgress}
        onDuration={onDuration}
        onEnded={onEnded}
      />
    </div>
  );
}

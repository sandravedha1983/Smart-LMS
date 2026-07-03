import { useMemo, useState, useRef, useCallback, useEffect } from 'react';

// Format time in seconds to mm:ss or hh:mm:ss
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === Infinity) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Escape special characters for regex matching
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function TranscriptViewer({ 
  transcript, 
  selectedText, 
  onSelection, 
  onExplain, 
  currentTime = 0, 
  duration = 0,
  transcriptionStatus = 'COMPLETED',
  transcriptionError = null,
  onRetry = null,
  isRetryLoading = false,
  onTimestampClick = null
}) {
  const [buttonPosition, setButtonPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const transcriptRef = useRef(null);
  const lastScrolledIndexRef = useRef(-1);

  // Parse transcript into timestamped segments
  const segments = useMemo(() => {
    if (!transcript || transcriptionStatus !== 'COMPLETED') return [];
    
    const timestampRegex = /\[(\d{1,2}:)?(\d{1,2}):(\d{2})(\.\d+)?\]/g;
    const hasTimestamps = timestampRegex.test(transcript);
    
    if (hasTimestamps) {
      timestampRegex.lastIndex = 0;
      const parts = [];
      let match;
      let lastIndex = 0;
      let currentStartTime = 0;

      while ((match = timestampRegex.exec(transcript)) !== null) {
        const textSegment = transcript.substring(lastIndex, match.index).trim();
        if (textSegment) {
          parts.push({
            start: currentStartTime,
            text: textSegment,
          });
        }

        const hrs = match[1] ? parseInt(match[1].replace(':', ''), 10) : 0;
        const mins = parseInt(match[2], 10);
        const secs = parseInt(match[3], 10);
        const ms = match[4] ? parseFloat(match[4]) : 0;
        currentStartTime = hrs * 3600 + mins * 60 + secs + ms;

        lastIndex = timestampRegex.lastIndex;
      }

      const remainingText = transcript.substring(lastIndex).trim();
      if (remainingText) {
        parts.push({
          start: currentStartTime,
          text: remainingText,
        });
      }

      for (let i = 0; i < parts.length; i++) {
        parts[i].end = i < parts.length - 1 ? parts[i + 1].start : Infinity;
      }

      return parts;
    } else {
      // Split by sentence boundaries and distribute evenly across total duration
      const sentenceRegex = /[^.!?]+[.!?]+(\s+|$)/g;
      const sentences = [];
      let match;
      while ((match = sentenceRegex.exec(transcript)) !== null) {
        const sentenceText = match[0].trim();
        if (sentenceText) {
          sentences.push(sentenceText);
        }
      }

      if (sentences.length === 0 && transcript.trim()) {
        sentences.push(transcript.trim());
      }

      const totalSeconds = duration || 60;
      const segmentDuration = Math.min(totalSeconds / Math.max(sentences.length, 1), 10);

      return sentences.map((text, index) => ({
        start: index * segmentDuration,
        end: (index + 1) * segmentDuration,
        text,
      }));
    }
  }, [transcript, duration, transcriptionStatus]);

  // Find all indices of segments matching the search query
  const matchingIndices = useMemo(() => {
    if (!searchQuery.trim() || segments.length === 0) return [];
    const q = searchQuery.toLowerCase();
    return segments
      .map((seg, idx) => (seg.text.toLowerCase().includes(q) ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [searchQuery, segments]);

  // Reset search match pointer when query changes
  useEffect(() => {
    setCurrentMatchIdx(0);
  }, [searchQuery]);

  // Determine which segment is active based on video current time
  const activeSegmentIndex = useMemo(() => {
    return segments.findIndex(
      (seg) => currentTime >= seg.start && currentTime < seg.end
    );
  }, [segments, currentTime]);

  const scrollToSegment = useCallback((index) => {
    const el = transcriptRef.current?.querySelector(`[data-index="${index}"]`);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, []);

  // Scroll active segment into view ONLY when active segment index changes
  useEffect(() => {
    if (activeSegmentIndex !== -1 && activeSegmentIndex !== lastScrolledIndexRef.current && searchQuery === '') {
      lastScrolledIndexRef.current = activeSegmentIndex;
      scrollToSegment(activeSegmentIndex);
    }
  }, [activeSegmentIndex, searchQuery, scrollToSegment]);

  const handleNextMatch = () => {
    if (matchingIndices.length === 0) return;
    const nextIdx = (currentMatchIdx + 1) % matchingIndices.length;
    setCurrentMatchIdx(nextIdx);
    scrollToSegment(matchingIndices[nextIdx]);
  };

  const handlePrevMatch = () => {
    if (matchingIndices.length === 0) return;
    const prevIdx = (currentMatchIdx - 1 + matchingIndices.length) % matchingIndices.length;
    setCurrentMatchIdx(prevIdx);
    scrollToSegment(matchingIndices[prevIdx]);
  };

  const handleCopy = () => {
    if (!transcript) return;
    // Strip timestamps like [00:12]
    const cleanText = transcript.replace(/\[(\d{1,2}:)?(\d{1,2}):(\d{2})(\.\d+)?\]/g, '').replace(/\s+/g, ' ').trim();
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const captureSelection = useCallback(() => {
    if (transcriptionStatus !== 'COMPLETED') return;
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString().trim();

    if (!text || text.length < 3) {
      setButtonPosition(null);
      onSelection('');
      return;
    }

    onSelection(text);

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = transcriptRef.current?.getBoundingClientRect();

    if (rect && containerRect) {
      setButtonPosition({
        top: rect.top - containerRect.top - 52,
        left: Math.min(
          Math.max(rect.left - containerRect.left + rect.width / 2, 90),
          containerRect.width - 90
        ),
      });
    }
  }, [onSelection, transcriptionStatus]);

  const handleMouseUp = useCallback(() => {
    setTimeout(captureSelection, 20);
  }, [captureSelection]);

  const handleTouchEnd = useCallback(() => {
    setTimeout(captureSelection, 100);
  }, [captureSelection]);

  const handleExplainClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onExplain();
  }, [onExplain]);

  const highlightText = (text, query, isHighlightedMatch) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
    return parts.map((part, i) => {
      const isMatch = part.toLowerCase() === query.toLowerCase();
      return isMatch ? (
        <mark
          key={i}
          className={`${
            isHighlightedMatch
              ? 'bg-amber-400 text-slate-950 font-bold px-1 py-0.5 rounded shadow-glow'
              : 'bg-yellow-400/30 text-white px-0.5 rounded'
          }`}
        >
          {part}
        </mark>
      ) : (
        part
      );
    });
  };

  return (
    <section
      ref={transcriptRef}
      className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-950/40 p-4 sm:p-6 shadow-glass max-h-[500px] overflow-y-auto backdrop-blur-md"
    >
      {/* Sticky Header with controls */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md pb-4 mb-4 border-b border-white/5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Transcript</h3>
              {/* Status indicators */}
              {transcriptionStatus === 'PENDING' || transcriptionStatus === 'PROCESSING' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20 animate-pulse">
                  🟡 Processing...
                </span>
              ) : transcriptionStatus === 'FAILED' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
                  🔴 Failed
                </span>
              ) : transcript ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  🟢 Ready
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-white/50">
              {transcriptionStatus === 'COMPLETED' 
                ? "Click any timestamp to seek, or highlight text to ask Dolphy for explanations."
                : "Captions are being synchronized."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {transcriptionStatus === 'COMPLETED' && transcript && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 transition active:scale-95"
              >
                <span>{copied ? '✓ Copied' : '📋 Copy'}</span>
              </button>
            )}
            {selectedText && transcriptionStatus === 'COMPLETED' && (
              <span className="rounded-full bg-sky-500/20 border border-sky-500/30 px-3 py-1 text-xs font-semibold text-sky-300">
                ✓ Selected
              </span>
            )}
          </div>
        </div>

        {/* Search bar inside header */}
        {transcriptionStatus === 'COMPLETED' && segments.length > 0 && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5">
            <span className="text-white/40 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm text-white placeholder-white/30 focus:outline-none focus:ring-0"
            />
            {searchQuery && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-white/50 select-none font-mono">
                  {matchingIndices.length > 0 ? `${currentMatchIdx + 1}/${matchingIndices.length}` : '0/0'}
                </span>
                <button
                  type="button"
                  onClick={handlePrevMatch}
                  disabled={matchingIndices.length === 0}
                  className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white disabled:opacity-30"
                  title="Previous match"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={handleNextMatch}
                  disabled={matchingIndices.length === 0}
                  className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white disabled:opacity-30"
                  title="Next match"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-white/40 hover:text-white text-xs px-1"
                  title="Clear search"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading, processing, failed or loaded states */}
      {transcriptionStatus === 'PENDING' || transcriptionStatus === 'PROCESSING' ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400/30 border-t-amber-400"></div>
          <p className="text-sm text-amber-300 font-medium animate-pulse text-center">
            Dolphy is extracting audio and transcribing this video.<br />
            <span className="text-xs text-white/40 font-normal">This happens in the background. Feel free to wait or check back in a moment.</span>
          </p>
        </div>
      ) : transcriptionStatus === 'FAILED' ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 text-center space-y-4">
          <div className="text-rose-400 text-3xl">⚠️</div>
          <p className="text-sm font-semibold text-rose-300">Automatic transcription failed.</p>
          {transcriptionError && (
            <p className="text-xs text-white/50 italic font-mono max-w-lg mx-auto bg-slate-900/60 p-3 rounded-xl border border-white/5 break-words">
              Error Details: {transcriptionError}
            </p>
          )}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetryLoading}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-500 active:scale-[0.97] disabled:opacity-50"
            >
              {isRetryLoading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
              ) : "🔄"}
              <span>Retry Transcription</span>
            </button>
          )}
        </div>
      ) : segments.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <p className="text-2xl">📄</p>
          <p className="mt-2 text-sm">Transcript is empty or unavailable for this lesson.</p>
        </div>
      ) : (
        <div
          onMouseUp={handleMouseUp}
          onTouchEnd={handleTouchEnd}
          className="prose prose-invert max-w-none select-text pb-6 space-y-2"
          style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
        >
          {segments.map((seg, index) => {
            const isActive = index === activeSegmentIndex;
            const isCurrentMatch = matchingIndices[currentMatchIdx] === index;

            return (
              <div
                key={index}
                data-index={index}
                className={`group flex items-start gap-3 p-2 rounded-xl transition-all duration-300 border ${
                  isActive
                    ? 'bg-sky-500/10 border-sky-500/20 shadow-glass'
                    : isCurrentMatch
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'border-transparent hover:bg-white/5'
                }`}
              >
                {/* Clickable timestamp */}
                <button
                  type="button"
                  onClick={() => onTimestampClick && onTimestampClick(seg.start)}
                  className={`font-mono text-xs px-2.5 py-0.5 rounded-full border transition shrink-0 mt-0.5 select-none ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      : 'bg-white/5 text-white/40 border-white/10 hover:text-sky-300 hover:border-sky-500/30'
                  }`}
                  title={`Seek video to ${formatTime(seg.start)}`}
                >
                  {formatTime(seg.start)}
                </button>

                {/* Segment Text */}
                <span 
                  className={`text-sm sm:text-base leading-7 flex-1 cursor-text ${
                    isActive ? 'text-sky-200 font-medium' : 'text-white/80'
                  }`}
                >
                  {highlightText(seg.text, searchQuery, isCurrentMatch)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Explain with AI popup button */}
      {buttonPosition && selectedText && transcriptionStatus === 'COMPLETED' ? (
        <div
          style={{
            top: Math.max(buttonPosition.top, 8),
            left: buttonPosition.left,
            transform: 'translateX(-50%)',
          }}
          className="pointer-events-none absolute z-20 transition-all duration-150"
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleExplainClick(e);
            }}
            onClick={handleExplainClick}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-sky-600/30 transition hover:from-sky-500 hover:to-blue-500 active:scale-95"
          >
            <span className="text-sm">🧠</span>
            <span>Explain with AI</span>
          </button>
        </div>
      ) : null}
    </section>
  );
}

import { useEffect, useState } from 'react';

export default function Typewriter({ lines = [], speed = 60, pause = 900, className = '', cursorClassName = '' }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let mounted = true;
    let idx = 0;
    let timeout;

    const type = () => {
      if (!mounted) return;
      const full = lines[currentLine] || '';
      if (idx <= full.length) {
        setDisplayed(full.slice(0, idx));
        idx += 1;
        timeout = setTimeout(type, speed);
      } else {
        // Pause, then delete
        setTyping(false);
        timeout = setTimeout(() => {
          deleteChars();
        }, pause);
      }
    };

    const deleteChars = () => {
      if (!mounted) return;
      const full = lines[currentLine] || '';
      if (idx > 0) {
        idx -= 1;
        setDisplayed(full.slice(0, idx));
        timeout = setTimeout(deleteChars, Math.max(30, speed / 2));
      } else {
        // Move to next line
        setCurrentLine((c) => (c + 1) % lines.length);
        setTyping(true);
        timeout = setTimeout(type, 120);
      }
    };

    type();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLine, lines, speed, pause]);

  return (
    <span className={className}>
      {displayed}
      <span className={cursorClassName} aria-hidden>
        &#160;|{/* simple cursor */}
      </span>
    </span>
  );
}

import React, { useState, useEffect, useCallback } from 'react';

type Mood = 'idle' | 'happy' | 'sleep' | 'wave';

const messages = [
  '喵~', '摸摸头~', '好无聊啊…', '有邮件吗？',
  '喵喵！', '困了… zzz', '嘿！', '要玩玩吗？',
];

const Pet: React.FC = () => {
  const [mood, setMood] = useState<Mood>('idle');
  const [message, setMessage] = useState('');
  const [hidden, setHidden] = useState(false);
  const [eyeClose, setEyeClose] = useState(false);

  const showMessage = useCallback((msg?: string) => {
    setMessage(msg || messages[Math.floor(Math.random() * messages.length)]);
    setTimeout(() => setMessage(''), 2500);
  }, []);

  useEffect(() => {
    if (mood === 'sleep') return;
    const blink = setInterval(() => {
      setEyeClose(true);
      setTimeout(() => setEyeClose(false), 200);
    }, 3000);
    return () => clearInterval(blink);
  }, [mood]);

  const handleClick = () => {
    setMood('happy');
    showMessage();
    setTimeout(() => setMood('idle'), 1500);
  };

  const handleMouseEnter = () => {
    if (mood === 'idle') {
      setMood('wave');
      setTimeout(() => setMood('idle'), 1200);
    }
  };

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="fixed bottom-4 right-4 w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all z-50 shadow-md"
        title="召唤猫咪"
      >
        <i className="fas fa-cat text-sm"></i>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {message && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-popover border shadow-md text-sm text-popover-foreground transition-opacity duration-200">
          {message}
        </div>
      )}
      <div className="relative group">
        <button
          onClick={() => setHidden(true)}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted/80 hover:bg-muted-foreground text-muted-foreground hover:text-background flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <i className="fas fa-times"></i>
        </button>
        <button
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          className="cursor-pointer select-none"
          title="点我互动~"
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 100 100"
            className={`transition-transform duration-300 ${
              mood === 'happy' ? 'scale-110' : mood === 'wave' ? 'animate-pulse' : ''
            } ${mood === 'sleep' ? 'opacity-70' : ''}`}
          >
            <g>
              <ellipse cx="50" cy="55" rx="30" ry="28" fill="var(--primary)" opacity="0.15" />
              <ellipse cx="50" cy="50" rx="28" ry="26" fill="var(--primary)" opacity="0.1" />
              <ellipse cx="50" cy="48" rx="25" ry="23" fill="currentColor" className="text-orange-400" />

              <ellipse cx="36" cy="40" rx="8" ry="7" fill="currentColor" className="text-orange-300" />
              <ellipse cx="64" cy="40" rx="8" ry="7" fill="currentColor" className="text-orange-300" />

              <polygon points="30,28 26,18 34,24" fill="currentColor" className="text-orange-400" />
              <polygon points="70,28 74,18 66,24" fill="currentColor" className="text-orange-400" />

              <ellipse cx="36" cy="40" rx="4" ry="4.5" fill="white" />
              <ellipse cx="64" cy="40" rx="4" ry="4.5" fill="white" />
              {eyeClose ? (
                <line x1="33" y1="41" x2="39" y2="41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-orange-800" />
              ) : (
                <>
                  <ellipse cx="36" cy="40" rx="2.5" ry="3" fill="currentColor" className="text-orange-800" />
                  <ellipse cx="64" cy="40" rx="2.5" ry="3" fill="currentColor" className="text-orange-800" />
                  <ellipse cx="37" cy="39" rx="1" ry="1" fill="white" />
                  <ellipse cx="65" cy="39" rx="1" ry="1" fill="white" />
                </>
              )}

              <ellipse cx="42" cy="28" rx="3" ry="2" fill="currentColor" className="text-orange-200" opacity="0.6" />
              <ellipse cx="58" cy="28" rx="3" ry="2" fill="currentColor" className="text-orange-200" opacity="0.6" />

              <ellipse cx="50" cy="47" rx="3" ry="2" fill="currentColor" className="text-pink-300" />

              {mood === 'happy' ? (
                <path d="M42 54 Q50 62 58 54" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-orange-700" />
              ) : mood === 'sleep' ? (
                <line x1="44" y1="55" x2="56" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-orange-700" />
              ) : (
                <path d="M43 53 Q50 57 57 53" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-orange-700" />
              )}

              {mood === 'wave' && (
                <g className="animate-wave origin-bottom">
                  <path d="M68 30 Q75 26 72 34" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-orange-500" />
                  <path d="M70 28 Q78 24 74 34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-orange-500" />
                </g>
              )}

              <line x1="35" y1="62" x2="30" y2="72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-orange-500" />
              <line x1="65" y1="62" x2="70" y2="72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-orange-500" />
              <line x1="30" y1="72" x2="26" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-orange-500" />
              <line x1="70" y1="72" x2="74" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-orange-500" />

              <ellipse cx="50" cy="68" rx="14" ry="4" fill="currentColor" className="text-orange-400" opacity="0.3" />
            </g>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pet;

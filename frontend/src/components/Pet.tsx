import React, { useState, useEffect, useRef } from 'react';

type Mood = 'idle' | 'happy' | 'sleep';

const reactions = [
  '喵~', '摸摸头~', '有邮件吗？', '喵喵！',
  '嘿！', '要玩玩吗？', '好无聊…', '！',
];

const CAT_IMAGE = 'https://images.unsplash.com/photo-jKZ-qephrG4?w=200&h=200&fit=crop&crop=face&q=80';

const Pet: React.FC = () => {
  const [mood, setMood] = useState<Mood>('idle');
  const [message, setMessage] = useState('');
  const [hidden, setHidden] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [eyeOpen, setEyeOpen] = useState(true);
  const sleepTimer = useRef<ReturnType<typeof setTimeout>>();

  const resetSleepTimer = () => {
    if (sleepTimer.current) clearTimeout(sleepTimer.current);
    setMood('idle');
    sleepTimer.current = setTimeout(() => setMood('sleep'), 15000);
  };

  useEffect(() => {
    resetSleepTimer();
    return () => { if (sleepTimer.current) clearTimeout(sleepTimer.current); };
  }, []);

  useEffect(() => {
    if (mood === 'sleep') { setEyeOpen(false); return; }
    setEyeOpen(true);
    const blink = setInterval(() => {
      setEyeOpen(false);
      setTimeout(() => setEyeOpen(true), 180);
    }, 3500 + Math.random() * 2500);
    return () => clearInterval(blink);
  }, [mood]);

  const handleClick = () => {
    resetSleepTimer();
    setMood('happy');
    setMessage(reactions[Math.floor(Math.random() * reactions.length)]);
    setTimeout(() => { setMood('idle'); setMessage(''); }, 2500);
  };

  const handleMouseEnter = () => { resetSleepTimer(); };

  if (hidden) {
    return (
      <button
        onClick={() => { setHidden(false); resetSleepTimer(); }}
        className="fixed right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-muted/70 hover:bg-muted flex items-center justify-center transition-all z-50 shadow-md hover:shadow-lg hover:-translate-y-[calc(50%+2px)]"
        title="召唤猫咪"
      >
        <span className="text-xl">🐱</span>
      </button>
    );
  }

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex items-start gap-2">
      <div className="relative group order-2">
        <button
          onClick={() => setHidden(true)}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <i className="fas fa-times"></i>
        </button>
        <div
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          className={`relative w-[100px] h-[100px] rounded-2xl overflow-hidden cursor-pointer select-none shadow-lg ring-2 ring-border transition-transform duration-300 hover:scale-105 hover:shadow-xl ${
            mood === 'happy' ? 'animate-bounce' : 'animate-float'
          }`}
        >
          {!imageError ? (
            <>
              <img
                src={CAT_IMAGE}
                alt="cat"
                className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <span className="text-4xl animate-pulse">🐱</span>
                </div>
              )}
              {!eyeOpen && (
                <div className="absolute inset-0 bg-black/20 transition-opacity duration-100" />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
              <span className={`text-5xl ${mood === 'happy' ? 'animate-bounce' : ''}`}>🐱</span>
            </div>
          )}
        </div>
      </div>
      {message && (
        <div className="order-1 px-3 py-1.5 rounded-xl bg-popover border shadow-md text-sm text-popover-foreground max-w-[160px]">
          {message}
        </div>
      )}
    </div>
  );
};

export default Pet;

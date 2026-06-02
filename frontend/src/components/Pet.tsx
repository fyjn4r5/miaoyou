import React, { useState, useEffect, useRef, useCallback } from 'react';

type Mood = 'idle' | 'happy' | 'sleep' | 'curious' | 'surprised';

interface Reaction {
  text: string;
  mood: Mood;
}

const reactions: Reaction[] = [
  { text: '喵~ 你终于来啦！', mood: 'happy' },
  { text: '喵喵！摸摸头~', mood: 'happy' },
  { text: '有邮件找我吗？', mood: 'curious' },
  { text: '喵！想我了吗？', mood: 'happy' },
  { text: '嘿~ 一起玩吧！', mood: 'happy' },
  { text: '唔… 好无聊啊', mood: 'idle' },
  { text: '！怎么了怎么了', mood: 'surprised' },
  { text: '喵~ 我在呢', mood: 'curious' },
  { text: '哈~ 困了…', mood: 'sleep' },
  { text: '要收邮件了吗？', mood: 'curious' },
  { text: '喵喵喵！', mood: 'happy' },
  { text: '瞅你咋地~', mood: 'curious' },
  { text: '！有动静', mood: 'surprised' },
  { text: '嗯？叫我吗', mood: 'curious' },
  { text: '好闲呀… 陪我玩', mood: 'idle' },
];

const CAT_IMAGE = 'https://images.unsplash.com/photo-jKZ-qephrG4?w=260&h=260&fit=crop&crop=face&q=80';

const Pet: React.FC = () => {
  const [mood, setMood] = useState<Mood>('idle');
  const [message, setMessage] = useState('');
  const [hidden, setHidden] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [eyeOpen, setEyeOpen] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const sleepTimer = useRef<ReturnType<typeof setTimeout>>();
  const clickTimer = useRef<ReturnType<typeof setTimeout>>();

  const resetSleepTimer = useCallback(() => {
    if (sleepTimer.current) clearTimeout(sleepTimer.current);
    setMood('idle');
    sleepTimer.current = setTimeout(() => setMood('sleep'), 18000);
  }, []);

  useEffect(() => {
    resetSleepTimer();
    return () => { if (sleepTimer.current) clearTimeout(sleepTimer.current); };
  }, [resetSleepTimer]);

  useEffect(() => {
    if (mood === 'sleep') { setEyeOpen(false); return; }
    setEyeOpen(true);
    const blink = setInterval(() => {
      setEyeOpen(false);
      setTimeout(() => setEyeOpen(true), 180);
    }, 3500 + Math.random() * 2500);
    return () => clearInterval(blink);
  }, [mood]);

  const pickReaction = useCallback(() => {
    const pool = reactions.filter(r => r.mood === mood || Math.random() < 0.4);
    return pool[Math.floor(Math.random() * pool.length)];
  }, [mood]);

  const handleClick = useCallback(() => {
    resetSleepTimer();
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setClickCount(0), 3000);

    let targetMood: Mood;
    if (newCount >= 4) targetMood = 'surprised';
    else if (newCount >= 2) targetMood = 'happy';
    else targetMood = 'curious';

    setMood(targetMood);
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    setMessage(reaction.text);
    setTimeout(() => { setMood('idle'); setMessage(''); }, 3000);
  }, [clickCount, resetSleepTimer]);

  const handleMouseEnter = useCallback(() => {
    resetSleepTimer();
  }, [resetSleepTimer]);

  if (hidden) {
    return (
      <button
        onClick={() => { setHidden(false); resetSleepTimer(); }}
        className="fixed right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-muted/70 hover:bg-muted flex items-center justify-center transition-all z-50 shadow-lg hover:shadow-xl hover:scale-105"
        title="召唤猫咪"
      >
        <span className="text-xl">🐱</span>
      </button>
    );
  }

  const moodEmoji = mood === 'sleep' ? '💤' : mood === 'happy' ? '😊' : mood === 'curious' ? '🤔' : mood === 'surprised' ? '😮' : '';

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex items-start gap-3">
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
          className={`relative w-[130px] h-[130px] rounded-2xl overflow-hidden cursor-pointer select-none shadow-lg ring-2 ring-border transition-all duration-500 ease-out hover:scale-105 hover:shadow-xl ${
            mood === 'happy' ? 'animate-happy' : mood === 'surprised' ? 'animate-happy' : 'animate-float'
          } ${mood === 'sleep' ? 'opacity-80 saturate-50' : ''}`}
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
                  <span className="text-5xl animate-pulse">🐱</span>
                </div>
              )}
              {!eyeOpen && (
                <div className="absolute inset-0 bg-black/20 transition-opacity duration-100" />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
              <span className={`text-6xl ${mood === 'happy' ? 'animate-happy' : ''}`}>🐱</span>
            </div>
          )}
          {moodEmoji && (
            <span className="absolute -top-1 -left-1 text-lg drop-shadow-sm">{moodEmoji}</span>
          )}
        </div>
      </div>
      <div className="order-1 flex flex-col gap-1.5 max-w-[180px]">
        {message && (
          <div className="px-3 py-2 rounded-xl bg-popover border shadow-md text-sm text-popover-foreground leading-relaxed">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pet;

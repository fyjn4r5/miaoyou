import React, { useState, useEffect, useRef, useCallback } from 'react';

type Mood = 'idle' | 'happy' | 'sleep' | 'curious' | 'surprised';

const PET_SYSTEM_PROMPT = '你是一只住在秒邮网站的可爱猫咪，叫喵喔。请用简短有趣的方式（不超过30字）回应主人的互动，语气要可爱、活泼，偶尔加个喵~。不要问问题。';

const CAT_IMAGE = 'https://images.unsplash.com/photo-jKZ-qephrG4?w=320&h=320&fit=crop&crop=face&q=80';

const PRESET_REACTIONS = [
  '喵~ 你终于来啦！',
  '喵喵！摸摸头~',
  '嘿~ 一起玩吧！',
  '唔… 好无聊啊',
  '喵~ 我在呢',
  '喵喵喵！',
  '瞅你咋地~',
];

const Pet: React.FC = () => {
  const [mood, setMood] = useState<Mood>('idle');
  const [message, setMessage] = useState('');
  const [hidden, setHidden] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [eyeOpen, setEyeOpen] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const sleepTimer = useRef<ReturnType<typeof setTimeout>>();
  const messageTimer = useRef<ReturnType<typeof setTimeout>>();

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
      setTimeout(() => setEyeOpen(true), 200);
    }, 4500 + Math.random() * 3000);
    return () => clearInterval(blink);
  }, [mood]);

  const showMessage = useCallback((text: string, duration = 5000) => {
    if (messageTimer.current) clearTimeout(messageTimer.current);
    setMessage(text);
    messageTimer.current = setTimeout(() => {
      setMessage('');
      setMood('idle');
    }, duration);
  }, []);

  const getAiReply = useCallback(async (prompt: string) => {
    setAiLoading(true);
    setMood('curious');
    showMessage('🐱 思考中...', 10000);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: [],
          systemPrompt: PET_SYSTEM_PROMPT
        })
      });
      if (!res.ok || !res.body) throw new Error('fail');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const token = JSON.parse(data).response;
              if (token) reply += token;
            } catch (_) {}
          }
        }
      }
      setMood('happy');
      showMessage(reply, 5000);
    } catch (_) {
      const fallback = PRESET_REACTIONS[Math.floor(Math.random() * PRESET_REACTIONS.length)];
      setMood('curious');
      showMessage(fallback, 4000);
    } finally {
      setAiLoading(false);
    }
  }, [showMessage]);

  const handleClick = useCallback(() => {
    resetSleepTimer();
    if (aiLoading) return;
    const prompts = [
      '跟主人打个招呼吧',
      '今天心情怎么样？跟主人说说',
      '主人来看你了，说点什么',
      '伸个懒腰跟主人打个招呼',
    ];
    getAiReply(prompts[Math.floor(Math.random() * prompts.length)]);
  }, [resetSleepTimer, aiLoading, getAiReply]);

  const handleMouseEnter = useCallback(() => {
    resetSleepTimer();
  }, [resetSleepTimer]);

  if (hidden) {
    return (
      <button
        onClick={() => { setHidden(false); resetSleepTimer(); }}
        className="fixed bottom-2 right-2 w-[52px] h-[52px] rounded-2xl bg-muted/80 hover:bg-muted flex items-center justify-center transition-all z-50 shadow-lg hover:shadow-xl hover:scale-105 ring-2 ring-border"
        title="召唤猫咪"
      >
        <span className="text-2xl">🐱</span>
      </button>
    );
  }

  const moodEmoji = mood === 'sleep' ? '💤' : mood === 'happy' ? '😊' : mood === 'curious' ? '🤔' : mood === 'surprised' ? '😮' : '';

  return (
    <div className="fixed bottom-2 right-2 z-50 flex flex-col-reverse items-end gap-2">
      <div className="relative group">
        <button
          onClick={() => setHidden(true)}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <i className="fas fa-times"></i>
        </button>
        <div
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          className={`relative w-[150px] h-[150px] rounded-2xl overflow-hidden cursor-pointer select-none shadow-lg ring-2 ring-border transition-all duration-500 ease-out hover:scale-105 hover:shadow-xl ${
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
                <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-2xl">
                  <span className="text-6xl animate-pulse">🐱</span>
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
          {aiLoading && (
            <div className="absolute inset-0 bg-black/10 rounded-2xl flex items-center justify-center">
              <span className="text-2xl animate-pulse">💭</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 max-w-[200px]">
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

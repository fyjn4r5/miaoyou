import React, { useState, useEffect, useRef, useCallback } from 'react';

type Mood = 'idle' | 'happy' | 'sleep' | 'curious' | 'surprised';

interface ChatMessage {
  role: 'cat' | 'user';
  text: string;
}

const PET_SYSTEM_PROMPT = '你是一只住在秒邮网站的可爱猫咪，叫喵邮。请用简短有趣的方式（不超过80字）回应主人，语气要可爱、活泼，偶尔加个喵~。';

const BUBBLE_MSGS = [
  '喵~ 主人来啦！今天过得怎么样呀？😊',
  '喵邮刚刚打了个盹，梦到主人了~ 💤',
  '主人你听，外面有小鸟在唱歌呢！🐦',
  '喵~ 今天天气真好，好想出去晒太阳~ ☀️',
  '主人要不要摸摸头？喵邮最喜欢了~ 🎀',
  '喵？主人是不是偷偷在想我呀？✨',
  '喵邮今天也很乖哦，有好好看家呢！🏠',
  '主人再点点我嘛~ 有惊喜等着你哦！😉',
  '喵~ 好想钻进主人怀里取暖~ 🧶',
  '主人工作累了吧？喵邮给你跳个舞！💃',
  '喵邮的尾巴今天特别蓬松，不信你看！🦊',
  '嘘…喵邮正在思考猫生大事呢… 🤔',
  '主人你知道吗，喵邮最喜欢你啦！💕',
  '喵~ 今天想吃什么？喵邮给你推荐小鱼干！🐟',
  '主人摸摸屏幕，就当是在摸喵邮了~ 🐾',
  '喵邮刚刚学会了一个新招数，想不想看？✨',
  '主人好~ 今天也是元气满满的一天呢！💪',
  '喵~ 喵邮的呼噜声有助睡眠哦，要听吗？🌙',
  '主人快看！喵邮的眼睛是不是特别好看？👀',
  '喵~ 再点一下，喵邮就告诉你一个小秘密！🤫',
];

const GREETINGS = [
  '喵~ 主人来啦！今天想聊点什么呢？😊',
  '喵邮在此！主人有什么吩咐呀？🐱',
  '嗨嗨~ 喵邮一直在等主人呢！✨',
  '主人好！想和喵邮玩什么呀？🎀',
];

const QUICK_TAGS = ['你好', '心情', '饿', '玩', '工作', '晚安', '谢谢'];

const CLICK_THRESHOLD = 10;

const CAT_IMAGE = 'https://images.unsplash.com/photo-jKZ-qephrG4?w=320&h=320&fit=crop&crop=face&q=80';

const Pet: React.FC = () => {
  const [mood, setMood] = useState<Mood>('idle');
  const [hidden, setHidden] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [eyeOpen, setEyeOpen] = useState(true);
  const [bubbleText, setBubbleText] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [showInvite, setShowInvite] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sleepTimer = useRef<ReturnType<typeof setTimeout>>();
  const bubbleTimer = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController | null>(null);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showBubble = useCallback((text: string) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setBubbleText(text);
    bubbleTimer.current = setTimeout(() => setBubbleText(''), 5000);
  }, []);

  const addCatMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, { role: 'cat', text }]);
  }, []);

  const addUserMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, { role: 'user', text }]);
  }, []);

  const getAiReply = useCallback(async (userText: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAiLoading(true);
    setMood('curious');

    try {
      const res = await fetch('/api/chat', {
        signal: controller.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: [],
          systemPrompt: PET_SYSTEM_PROMPT
        })
      });
      if (!res.ok || !res.body) throw new Error('fail');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = '';
      setMessages(prev => [...prev, { role: 'cat', text: '' }]);
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
        setMessages(prev => {
          const next = [...prev];
          if (next.length > 0) next[next.length - 1] = { role: 'cat', text: reply };
          return next;
        });
      }
      setMood('happy');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessages(prev => {
        const next = [...prev];
        if (next.length > 0) {
          next[next.length - 1] = { role: 'cat', text: '喵~ 信号不太好，再试试？😿' };
        } else {
          next.push({ role: 'cat', text: '喵~ 信号不太好，再试试？😿' });
        }
        return next;
      });
      setMood('curious');
    } finally {
      setAiLoading(false);
      abortRef.current = null;
    }
  }, []);

  const handleCatClick = useCallback(() => {
    resetSleepTimer();
    if (showInvite) return;

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount >= CLICK_THRESHOLD) {
      setShowInvite(true);
      return;
    }

    setMood('happy');
    const idx = (nextCount - 1) % BUBBLE_MSGS.length;
    showBubble(BUBBLE_MSGS[idx]);
  }, [clickCount, showInvite, resetSleepTimer, showBubble]);

  const openAiChat = useCallback(() => {
    setShowInvite(false);
    setChatOpen(true);
    setMood('happy');
    if (messages.length === 0) {
      addCatMessage(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [messages.length, addCatMessage]);

  const closeChat = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setChatOpen(false);
    setClickCount(0);
    setMood('idle');
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || aiLoading) return;
    setInput('');
    addUserMessage(msg);
    await getAiReply(msg);
  }, [input, aiLoading, addUserMessage, getAiReply]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  }, [handleSend]);

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
    <>
      <div className="fixed bottom-2 right-2 z-50">
        <div className="relative">
          {bubbleText && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 rounded-xl bg-popover border shadow-md text-sm text-popover-foreground truncate max-w-[220px] animate-in fade-in slide-in-from-bottom-2 duration-200">
              {bubbleText}
            </div>
          )}
          <div className="relative group">
          <button
            onClick={() => setHidden(true)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <i className="fas fa-times"></i>
          </button>
          <div
            onClick={handleCatClick}
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
          </div>
        </div>
      </div>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30" onClick={() => setShowInvite(false)}>
          <div
            className="bg-background rounded-xl shadow-2xl p-6 w-[320px] max-w-[85vw] text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-5xl mb-3">🐱</div>
            <h3 className="text-lg font-bold mb-2">和喵邮聊天吧！</h3>
            <p className="text-sm text-muted-foreground mb-5">
              想和喵邮对话吗？
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowInvite(false)}
                className="px-4 py-2 text-sm rounded-lg border border-muted-foreground/30 text-muted-foreground hover:text-foreground transition-colors"
              >
                再逗逗
              </button>
              <button
                onClick={openAiChat}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                开始聊天
              </button>
            </div>
          </div>
        </div>
      )}

      {chatOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30" onClick={closeChat}>
          <div
            className="bg-background rounded-xl shadow-2xl w-[520px] max-w-[92vw] max-h-[82vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐱</span>
                <span className="font-semibold text-sm">喵邮 AI</span>
              </div>
              <button
                onClick={closeChat}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[400px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed break-words ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-muted-foreground rounded-bl-md'
                    }`}
                  >
                    {msg.text || (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{animationDelay: '0ms'}} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{animationDelay: '150ms'}} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{animationDelay: '300ms'}} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleSend(tag)}
                  disabled={aiLoading}
                  className="px-2.5 py-1 text-xs rounded-full border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="px-4 pb-3 pt-1 border-t flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={aiLoading}
                placeholder="跟喵邮说说话..."
                className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || aiLoading}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground disabled:opacity-40 transition-opacity shrink-0"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Pet;

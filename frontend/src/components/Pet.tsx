import React, { useState, useEffect, useRef, useCallback } from 'react';

type Mood = 'idle' | 'happy' | 'sleep' | 'curious' | 'surprised';

interface ChatMessage {
  role: 'cat' | 'user';
  text: string;
}

const PET_SYSTEM_PROMPT = '你是一只住在秒邮(zmail)网站的可爱猫咪，叫喵喵。秒邮是一个无需手机号、无需任何个人信息就能创建永久匿名邮箱的网站，一键创建，设置密码后可随时登录找回，完全保护隐私安全。请用简短有趣的方式（不超过80字）回应主人，语气要活泼、可爱，偶尔加个喵~，并适时介绍秒邮的各种优点和特色。';

const BUBBLE_MSGS = [
  '喵~ 主人来啦！今天过得怎么样呀？😊',
  '喵喵刚刚打了个盹，做了个美梦~ 💤',
  '主人你听，外面有小鸟在唱歌呢！🐦',
  '喵~ 今天天气真好，想出去晒太阳~ ☀️',
  '主人要不要摸摸头？喵喵可开心了~ 🎀',
  '喵喵今天也很乖哦，有好好看家呢！🏠',
  '主人再点点我嘛~ 有惊喜等着你哦！😉',
  '主人工作累了吧？喵喵给你跳个舞！💃',
  '喵喵的尾巴今天特别蓬松，不信你看！🦊',
  '嘘…喵喵正在思考猫生大事呢… 🤔',
  '主人你知道吗，喵喵觉得你最棒啦！✨',
  '喵~ 今天想吃什么？喵喵给你推荐小鱼干！🐟',
  '主人摸摸屏幕，就当是在摸喵喵了~ 🐾',
  '喵喵刚刚学会了一个新招数，想不想看？✨',
  '主人好~ 今天也是元气满满的一天呢！💪',
  '喵~ 喵喵的呼噜声有助睡眠哦，要听吗？🌙',
  '主人快看！喵喵的眼睛是不是特别好看？👀',
  '喵~ 再点一下，喵喵就告诉你一个小秘密！🤫',
  '今天有邮件来了吗？喵喵帮你盯着呢！📧',
  '喵喵学会了一个超酷的新表情，你看！😎',
  '主人猜猜喵喵今天看到什么有趣的事了？🤗',
  '喵~ 生活就像小鱼干，要慢慢品味~ 🐟',
  '叮！您的可爱喵喵已上线，请注意查收~ 📩',
  '主人今天的发型很好看哦，喵喵认证！✨',
  '喵喵刚刚伸了个懒腰，舒服极了~ 😌',
  '嘘…喵喵在偷偷练习唱歌，好听吗？🎵',
  '主人有没有好好吃饭呀？喵喵很关心哦！🍚',
  '喵~ 什么都不想做，就想和主人待着~ 🎀',
  '喵喵刚学会数数，一、二、三… 主人最好啦！✨',
  '据说多看猫咪可以减压，主人多看看喵喵吧~ 🐱',
  '喵喵今天好像有点感冒，阿嚏！🤧',
  '头有点晕晕的，是不是昨晚没睡好… 😵‍💫',
  '喵~ 肚子有点饿饿的，想吃小鱼干了… 🐟',
  '喵喵正在发呆中，请勿打扰… 😐',
  '爪爪有点痒，好想抓抓沙发… 🐾',
  '今天好困好困，眼睛都快睁不开了… 😴',
  '喵喵感觉毛色今天特别亮，帅不帅？✨',
  '喵… 今天心情有点低落，让喵喵静一静… 🌧️',
  '耳朵竖得高高的，听到主人的声音啦！👂',
  '喵喵今天跑酷了一整天，好累呀… 🏃',
  '打了个大大的哈欠，主人也困了吗？🥱',
  '今天喝水好多，肚子圆滚滚的了~ 💧',
];

const GREETINGS = [
  '喵~ 主人来啦！今天想聊点什么呢？😊',
  '喵喵在此！主人有什么吩咐呀？🐱',
  '嗨嗨~ 喵喵一直在等主人呢！✨',
  '主人好！想和喵喵玩什么呀？🎀',
];

const QUICK_TAGS = ['秒邮是什么', '怎么保护隐私', '喵喵推荐', '临时邮箱', '猜谜语', '冷笑话', '喵喵日常', '绕口令', '脑筋急转弯'];

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
  const [bubbleOffset, setBubbleOffset] = useState(0);
  const [showInvite, setShowInvite] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
    const idx = (nextCount - 1 + bubbleOffset) % BUBBLE_MSGS.length;
    showBubble(BUBBLE_MSGS[idx]);
  }, [clickCount, showInvite, bubbleOffset, resetSleepTimer, showBubble]);

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
            <div className="absolute bottom-full right-0 mb-2 px-4 py-2.5 rounded-2xl bg-popover border shadow-lg text-sm text-popover-foreground leading-relaxed whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30" onClick={() => { setShowInvite(false); setClickCount(0); setBubbleOffset(Math.floor(Math.random() * BUBBLE_MSGS.length)); }}>
          <div
            className="bg-background rounded-xl shadow-2xl p-6 w-[320px] max-w-[85vw] text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-5xl mb-3">🐱</div>
            <h3 className="text-lg font-bold mb-2">和喵喵聊天吧！</h3>
            <p className="text-sm text-muted-foreground mb-5">
              想和喵喵对话吗？
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowInvite(false);
                  setClickCount(0);
                  setBubbleOffset(Math.floor(Math.random() * BUBBLE_MSGS.length));
                }}
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
            className="bg-background rounded-xl shadow-2xl w-[840px] max-w-[94vw] h-[80vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐱</span>
                <span className="font-semibold text-sm">喵喵</span>
              </div>
              <button
                onClick={closeChat}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
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

            <div className="px-4 pb-3 pt-2 border-t flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                disabled={aiLoading}
                placeholder="跟喵喵说说话...（Enter 发送，Shift+Enter 换行）"
                rows={4}
                className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || aiLoading}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground disabled:opacity-40 transition-opacity shrink-0 mb-[1px]"
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

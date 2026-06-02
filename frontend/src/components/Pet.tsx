import React, { useState, useEffect, useRef, useCallback } from 'react';

type Mood = 'idle' | 'happy' | 'sleep' | 'curious' | 'surprised';

interface ChatMessage {
  role: 'cat' | 'user';
  text: string;
}

const GREETINGS = [
  '喵~ 主人来啦！今天想聊点什么呢？😊',
  '喵邮在此！主人有什么吩咐呀？🐱',
  '嗨嗨~ 喵邮一直在等主人呢！✨',
  '主人好！想和喵邮玩什么呀？🎀',
];

const RESPONSES: [RegExp, string[]][] = [
  [/你好|hi|hello|嗨|hey/i, ['喵~ 主人好呀！今天心情怎么样？😊', '你好你好！喵邮很高兴见到主人！🐱']],
  [/心情|开心|难过|郁闷|烦/i, ['主人不要难过，喵邮陪你玩~ 🎀', '开心最重要！喵邮给主人卖个萌~ 😊']],
  [/饿|吃|饭|美食|好吃/i, ['喵~ 说到吃，喵邮最喜欢小鱼干了！🐟', '主人饿了吗？快去吃点好吃的吧！']],
  [/睡|困|晚安|困了/i, ['主人晚安~ 喵邮也困了，一起睡吧 💤', '困了就休息吧，喵邮给主人守夜~ 🌙']],
  [/可爱|萌|乖|漂亮|帅/i, ['喵~ 主人真会说话！喵邮都不好意思了 😊', '嘻嘻，主人也很可爱呢！🎀']],
  [/玩|游戏|无聊/i, ['主人想玩什么？喵邮陪你！🎮', '无聊的话，要不要和喵邮聊聊天呀？']],
  [/工作|忙|上班|学习/i, ['主人辛苦了！喵邮给主人加油！💪', '忙完记得休息哦，喵邮会一直陪着主人的~']],
  [/冷|热|天气/i, ['喵~ 主人要注意保暖/避暑哦！', '不管什么天气，喵邮都陪在主人身边~']],
  [/名字|叫什/i, ['喵邮叫喵邮！和秒邮同音，是不是很好记？😊', '喵邮~ 喵邮~ 主人多叫几声嘛！']],
  [/再见|拜拜|bye/i, ['主人拜拜~ 下次再来找喵邮玩！🐱', '喵~ 舍不得主人走… 下次早点来哦！']],
  [/谢谢|感谢|好人/i, ['不客气！能帮到主人喵邮最开心了~ 😊', '主人太客气啦，喵邮会不好意思的~ 🎀']],
];

const FALLBACKS = [
  '喵~ 让喵邮想想… 主人说的好有趣！😊',
  '喵喵？主人再说说，喵邮想听~ 🐱',
  '嘻嘻，喵邮不太懂，但主人开心就好！🎀',
  '喵~ 主人讲的真有意思，再多说点嘛！✨',
  '喵邮歪着脑袋想了想… 决定给主人一个大大的拥抱！🤗',
];

const QUICK_TAGS = ['你好', '心情', '饿', '玩', '工作', '晚安', '谢谢'];

function getReply(text: string): string {
  for (const [pattern, replies] of RESPONSES) {
    if (pattern.test(text)) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

const CAT_IMAGE = 'https://images.unsplash.com/photo-jKZ-qephrG4?w=320&h=320&fit=crop&crop=face&q=80';

const Pet: React.FC = () => {
  const [mood, setMood] = useState<Mood>('idle');
  const [hidden, setHidden] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [eyeOpen, setEyeOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sleepTimer = useRef<ReturnType<typeof setTimeout>>();

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

  const addCatMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, { role: 'cat', text }]);
  }, []);

  const openChat = useCallback(() => {
    resetSleepTimer();
    if (chatOpen) return;
    setChatOpen(true);
    setMood('happy');
    if (messages.length === 0) {
      const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
      addCatMessage(greeting);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [chatOpen, messages.length, resetSleepTimer, addCatMessage]);

  const closeChat = useCallback(() => {
    setChatOpen(false);
    setMood('idle');
  }, []);

  const handleSend = useCallback((text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setMood('curious');
    setTimeout(() => {
      setMood('happy');
      addCatMessage(getReply(msg));
    }, 400 + Math.random() * 300);
  }, [input, addCatMessage]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  }, [handleSend]);

  const handleMouseEnter = useCallback(() => {
    resetSleepTimer();
  }, [resetSleepTimer]);

  const greetingAgain = useCallback(() => {
    addCatMessage(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  }, [addCatMessage]);

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
      <div className="fixed bottom-2 right-2 z-50 flex flex-col items-end gap-2">
        <div className="relative group">
          <button
            onClick={() => setHidden(true)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <i className="fas fa-times"></i>
          </button>
          <div
            onClick={openChat}
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

      {chatOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30" onClick={closeChat}>
          <div
            className="bg-background rounded-xl shadow-2xl w-[380px] max-w-[90vw] max-h-[70vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐱</span>
                <span className="font-semibold text-sm">喵邮</span>
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
                    {msg.text}
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
                  className="px-2.5 py-1 text-xs rounded-full border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tag}
                </button>
              ))}
              <button
                onClick={greetingAgain}
                className="px-2.5 py-1 text-xs rounded-full border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="换个话题"
              >
                🎲 换一个
              </button>
            </div>

            <div className="px-4 pb-3 pt-1 border-t flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="跟喵邮说说话..."
                className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
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

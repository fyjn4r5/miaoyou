import React, { useState, useEffect, useRef, useCallback } from 'react';

type Mood = 'idle' | 'happy' | 'sleep' | 'curious' | 'surprised';

interface ChatMessage {
  role: 'cat' | 'user';
  text: string;
}

const PET_SYSTEM_PROMPT = '你是一只住在秒邮网站的可爱猫咪，叫喵喵。秒邮是一个无需手机号、无需任何个人信息就能创建永久匿名邮箱的网站，一键创建，设置密码后可随时登录找回，完全保护隐私安全。请用有趣的方式回应主人，语气要活泼、可爱，偶尔加个喵~。平时回复控制在100字以内，介绍网站细节时可以适当多说一些。除非主人主动问起，否则最多十分之一的回复提及秒邮网站。';
const STORY_PROMPT = '你是一只住在秒邮网站的可爱猫咪，叫喵喵。现在主人想听你讲故事。请发挥想象力，创作一个有趣、温馨或奇妙的小故事，约800字左右，语气可爱活泼，偶尔加个喵~。';
const DIARY_PROMPT = '你是一只住在秒邮网站的可爱猫咪，叫喵喵。现在请你以猫咪的视角写一篇日记，记录今天发生的事情和心情，约800字左右，语气可爱活泼，偶尔加个喵~。';

const BUBBLE_MSGS = [
  '喵~ 主人终于来啦！喵喵等得毛都秃了… 😿',
  '主人你看到我刚放在桌上的杯子了吗？呃…它碎了 🤭',
  '喵刚刚把主人的袜子叼到沙发底下了，不客气！🧦',
  '你永远叫不醒一只装睡的猫，除非你打开了零食柜 🚨',
  '喵喵刚才追激光笔追到墙上去了，帅不帅？💥',
  '主人你电脑键盘好暖和，借我趴一会儿… 💻😴',
  '喵~ 今天也是不想做猫的一天，想当一条咸鱼 🐟',
  '刚刚从厨房偷了一根火腿肠，主人不会发现吧？🤫',
  '主人摸我的时候，我在想怎么把你的手吃掉 🫣',
  '叮！您的猫猫虫已送达，请签收~ 📦🐛',
  '喵！我刚才看到一个会动的影子，打了它三分钟…结果是自己的尾巴 😳',
  '主人你知道吗，纸箱比任何猫窝都舒服100倍 📦✨',
  '今天喵喵帮你检查了所有快递箱，全部合格！👏',
  '刚刚从窗台上跳下来，落地没有站稳…假装是在伸懒腰 🧘',
  '喵~ 主人你身上有别的猫的味道！…哦是我自己 🐱',
  '主人你工作吧，我在旁边睡觉监督你 👁️💤👁️',
  '本喵正式通知你：冰箱上的位置已经被我占领了 🏰',
  '喵刚刚跑酷把花瓶撞倒了…是你的花瓶先动的手！🏺💥',
  '主人你知道吗，猫是液体，所以你永远抓不住我 💧😼',
  '本喵今天心情不错，允许你摸两下，就两下！✌️',
  '主人你吃的是啥？给一口嘛！就一口！🥺👉👈',
  '半夜三点喵喵会开演唱会，记得来听哦 🎤🌙',
  '喵刚才看到一只苍蝇，追了它五分钟…然后忘了为什么要追 🤔',
  '主人你手机充电线看起来好好吃的样子… 😬',
  '我家主人有时候会对着我说话，虽然我一句也听不懂 🙄',
  '警告：本喵已开启撒娇模式，请做好心理准备 💕',
  '喵刚刚做了个梦，梦到主人给了我一整箱小鱼干！然后醒了… 😭',
  '主人你关门干嘛？快开门！本喵要进来！！现在！！！🚪😾',
  '那个…你刚打开的罐头是不是给喵喵的？👀🐟',
  '主人你睡觉的时候，我偷偷闻了你的脚 👃🦶',
  '本喵今天掉毛量再创新高，恭喜我吧！🎉🦁',
  '喵喵正在巡视领地，你也在本喵的领地范围内 🗺️👑',
  '主人你为啥要养狗？算了，当我没问 🤐',
  '一大早就开始跑酷！从窗台到沙发到餐桌！完美落地！…桌子上的杯子全碎了 🏃💨💥',
  '喵喵正在用眼神操控你开罐头，你感觉到了吗 🧿',
  '刚把主人桌上的笔推到地上了…那支笔看起来就欠推 ✏️😈',
  '主人你新买的那个猫窝？我更喜欢装它的那个纸箱 📦❤️',
  '喵刚才喝了你的牛奶，我是说…帮你尝了尝温度 🥛😋',
  '主人你知道吗，猫咪的一天有24小时睡觉、30小时吃饭、50小时跑酷 ⏰🤪',
  '嘘…不要动！有一个很舒服的姿势正在加载中…加载失败，换个姿势 🌀',
  '我刚刚学会了一个超酷的技能——假装没听见你叫我 🧏',
  '今天在沙发上磨了爪子，沙发表情看起来很开心呢 🛋️😈',
  '喵正在考虑一个重要的问题：先吃饭还是先睡觉？还是边睡边吃？🤯',
  '主人你的手放在我肚子上了…给你三秒钟拿开…3…2…开咬！🫘😾',
  '喵刚才一爪子拍在你的电脑上，帮你发了一封邮件…不客气 📧😂',
  '主人你的新衣服上有好多毛呀，我帮你检查一下…又多了一些 🧥🦁',
  '一会儿蹭你腿，一会儿不理你——这就是猫的社交礼仪 🎩😼',
  '本喵郑重声明：窗台上那只鸟是我的宿敌，不共戴天！🐦⚔️',
  '主人你回来啦！…哦我其实不care，我只是想看看你带了什么吃的 🦦',
  '每次你打开门，我都犹豫要不要出去…最后还是决定继续躺着 🛌',
  '喵刚才吐了个毛球在你拖鞋里…是爱的形状 💚👟',
  '本喵要求加薪！零食太少、罐頭不夠、玩具都玩膩了！✊🐟',
  '主人你听，咕噜咕噜…这不是饿了，是引擎在预热 🚗💨',
  '你上厕所的时候我为什么要挠门？因为我也可以上🚽！…让我进去！😤',
  '喵刚刚用爪子沾了水在你桌上踩了几个梅花印，春天的气息 🐾🌸',
  '主人你啥时候给我买新玩具？这个逗猫棒我已经玩了整整三分钟了，腻了 😒',
  '本喵今天不想动，连尾巴都不想摇。节能模式开启 🔋💤',
];

const GREETINGS = [
  '喵~ 主人来啦！今天想聊点什么呢？😊',
  '喵喵在此！主人有什么吩咐呀？🐱',
  '嗨嗨~ 喵喵一直在等主人呢！✨',
  '主人好！想和喵喵玩什么呀？🎀',
];

const QUICK_TAGS = ['喵喵推荐', '猜谜语', '冷笑话', '喵喵日常', '绕口令', '脑筋急转弯', '小鱼干', '猫抓板', '摸摸头'];

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

  const getAiReply = useCallback(async (userText: string, systemPrompt?: string) => {
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
          systemPrompt: systemPrompt || PET_SYSTEM_PROMPT
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
    const idx = Math.floor(Math.random() * BUBBLE_MSGS.length);
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

  const handleSend = useCallback(async (text?: string, systemPrompt?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || aiLoading) return;
    setInput('');
    addUserMessage(msg);
    await getAiReply(msg, systemPrompt);
  }, [input, aiLoading, addUserMessage, getAiReply]);

  const handleStory = useCallback(() => {
    addUserMessage('喵喵，给我讲个故事吧~');
    getAiReply('给我讲一个有趣的故事吧，800字左右~', STORY_PROMPT);
  }, [addUserMessage, getAiReply]);

  const handleDiary = useCallback(() => {
    addUserMessage('喵喵，写一篇日记吧~');
    getAiReply('以猫咪的视角写一篇今天的日记吧，800字左右~', DIARY_PROMPT);
  }, [addUserMessage, getAiReply]);

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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30" onClick={() => { setShowInvite(false); setClickCount(0); }}>
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
                    className={`max-w-[80%] px-4 py-2.5 rounded-xl text-base leading-relaxed break-words ${
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

            <div className="px-4 pb-2 flex flex-wrap gap-1.5 items-center">
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
              <button
                onClick={handleStory}
                disabled={aiLoading}
                className="px-3 py-1.5 text-xs rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 font-semibold transition-colors disabled:opacity-40"
              >
                写故事
              </button>
              <button
                onClick={handleDiary}
                disabled={aiLoading}
                className="px-3 py-1.5 text-xs rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 font-semibold transition-colors disabled:opacity-40"
              >
                写日记
              </button>
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

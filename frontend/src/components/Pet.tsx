import React, { useState } from 'react';

type Mood = 'idle' | 'happy';

const reactions = [
  '喵~', '摸摸头~', '有邮件吗？', '喵喵！',
  '嘿！', '要玩玩吗？', '好无聊…', '！',
];

const Pet: React.FC = () => {
  const [mood, setMood] = useState<Mood>('idle');
  const [message, setMessage] = useState('');
  const [hidden, setHidden] = useState(false);

  const handleClick = () => {
    setMood('happy');
    setMessage(reactions[Math.floor(Math.random() * reactions.length)]);
    setTimeout(() => { setMood('idle'); setMessage(''); }, 2000);
  };

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="fixed bottom-4 right-4 w-10 h-10 rounded-full bg-muted/70 hover:bg-muted flex items-center justify-center transition-all z-50 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        title="召唤猫咪"
      >
        <span className="text-lg">🐱</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {message && (
        <div className="px-3 py-1.5 rounded-xl bg-popover border shadow-md text-sm text-popover-foreground">
          {message}
        </div>
      )}
      <div className="relative group">
        <button
          onClick={() => setHidden(true)}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <i className="fas fa-times"></i>
        </button>
        <button
          onClick={handleClick}
          className={`cursor-pointer select-none transition-transform duration-300 hover:scale-110 ${mood === 'happy' ? 'animate-bounce' : 'hover:animate-pulse'}`}
        >
          <span className="text-4xl block leading-none">🐈</span>
        </button>
      </div>
    </div>
  );
};

export default Pet;

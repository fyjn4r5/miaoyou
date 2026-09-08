import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MailboxContext } from '../contexts/MailboxContext';
import Container from '../components/Container';
import { sendInternalMessage, getInternalChat } from '../utils/api';

interface ChatMessage {
  id: string;
  fromAddress: string;
  toAddress: string;
  fromName: string;
  subject: string;
  textContent: string;
  receivedAt: number;
  isRead: boolean;
}

const POLL_INTERVAL = 4000;

const InternalChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { mailbox, showSuccessMessage, showErrorMessage } = useContext(MailboxContext);

  const [peer, setPeer] = useState('');
  const [connectedPeer, setConnectedPeer] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedPeer, setSavedPeer] = useState(() => {
    try {
      return localStorage.getItem('internalChatPeer') || '';
    } catch {
      return '';
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sinceRef = useRef(0);
  const myAddress = mailbox?.address || '';

  useEffect(() => {
    if (savedPeer) {
      setPeer(savedPeer);
      setConnectedPeer(savedPeer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 增量轮询：根据维护的 since 只拉取新消息，降低 D1 读取量
  const poll = useCallback(async (isInitial: boolean) => {
    if (!myAddress || !connectedPeer) return;

    const since = isInitial ? 0 : sinceRef.current;
    const result = await getInternalChat(myAddress, connectedPeer, since);

    if (result.success && result.messages) {
      const incoming: ChatMessage[] = result.messages;
      if (incoming.length > 0) {
        setMessages(prev => {
          if (isInitial) return incoming;
          const seen = new Set(prev.map(m => m.id));
          const merged = [...prev];
          for (const m of incoming) {
            if (!seen.has(m.id)) merged.push(m);
          }
          return merged;
        });
        const latest = incoming[incoming.length - 1];
        sinceRef.current = latest.receivedAt;
      }
    }
  }, [myAddress, connectedPeer]);

  useEffect(() => {
    if (!myAddress || !connectedPeer) return;
    let active = true;
    setLoading(true);
    poll(true).finally(() => {
      if (active) setLoading(false);
    });

    const id = window.setInterval(() => {
      if (active) poll(false);
    }, POLL_INTERVAL);

    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [myAddress, connectedPeer, poll]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [connectedPeer]);

  const handleStart = () => {
    const target = peer.trim().toLowerCase();
    if (!target) return;
    if (target === myAddress) {
      showErrorMessage(t('internalChat.selfError'));
      return;
    }
    setConnectedPeer(target);
    setSavedPeer(target);
    try {
      localStorage.setItem('internalChatPeer', target);
    } catch {}
    sinceRef.current = 0;
    setMessages([]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !myAddress || !connectedPeer || sending) return;

    setSending(true);
    const result = await sendInternalMessage(myAddress, connectedPeer, text);
    setSending(false);

    if (result.success) {
      setInput('');
      inputRef.current?.focus();
      // 立即触发一次增量刷新，展示刚发送的消息
      await poll(false);
    } else {
      const msg = typeof result.error === 'string' ? result.error : t('internalChat.sendFailed');
      showErrorMessage(msg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setConnectedPeer('');
    setPeer('');
    setMessages([]);
    sinceRef.current = 0;
    try {
      localStorage.removeItem('internalChatPeer');
    } catch {}
  };

  return (
    <Container>
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
        {!myAddress ? (
          <div className="flex items-center justify-center min-h-[50vh] text-center">
            <div>
              <div className="text-5xl mb-4 opacity-30"><i className="fas fa-envelope"></i></div>
              <p className="text-lg text-muted-foreground">{t('internalChat.needLogin')}</p>
            </div>
          </div>
        ) : !connectedPeer ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
            <div className="text-5xl opacity-30"><i className="fas fa-comments"></i></div>
            <div>
              <h1 className="text-2xl font-bold mb-2">{t('internalChat.title')}</h1>
              <p className="text-muted-foreground text-sm max-w-md">{t('internalChat.intro')}</p>
              <p className="text-xs text-muted-foreground/70 mt-2">{t('internalChat.myAddress')}: <span className="font-mono text-primary">{myAddress}</span></p>
            </div>
            <div className="w-full max-w-md flex gap-2">
              <input
                type="text"
                value={peer}
                onChange={e => setPeer(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleStart(); }}
                placeholder={t('internalChat.peerPlaceholder')}
                className="flex-1 px-4 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleStart}
                disabled={!peer.trim()}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {t('internalChat.start')}
              </button>
            </div>
            <p className="text-xs text-muted-foreground/60">{t('internalChat.peerHint')}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-4 border-b">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={resetChat}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                  title={t('internalChat.back')}
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <div className="min-w-0">
                  <div className="font-medium truncate">{connectedPeer}</div>
                  <div className="text-xs text-muted-foreground">{t('internalChat.online')}</div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {messages.length} {t('internalChat.messages')}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {loading && messages.length === 0 ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-20">
                  <div className="text-4xl mb-3 opacity-30"><i className="fas fa-comment-dots"></i></div>
                  <p>{t('internalChat.empty')}</p>
                </div>
              ) : (
                messages.map(m => {
                  const isMine = m.fromAddress === myAddress;
                  return (
                    <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isMine
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{m.textContent}</p>
                        <div className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}>
                          {formatTime(m.receivedAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="py-4 border-t">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('internalChat.inputPlaceholder')}
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 rounded-full border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
                >
                  {sending ? '...' : t('internalChat.send')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Container>
  );
};

function formatTime(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export default InternalChatPage;

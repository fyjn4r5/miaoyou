import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { MailboxContext } from '../contexts/MailboxContext';
import Container from '../components/Container';
import { sendInternalMessage, getInternalChat, getFullInternalChat, clearInternalChat, getInternalChatConversations } from '../utils/api';

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
  const [searchParams] = useSearchParams();

  const [peer, setPeer] = useState('');
  const [connectedPeer, setConnectedPeer] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showClearMenu, setShowClearMenu] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sinceRef = useRef(0);
  const myAddress = mailbox?.address || '';

  // 支持 ?peer=xxx 直达：从收件箱站内消息点击进入时自动开始聊天
  useEffect(() => {
    const peerParam = searchParams.get('peer');
    if (peerParam && peerParam.trim()) {
      const target = peerParam.trim().toLowerCase();
      if (target !== myAddress) {
        setPeer(target);
        setConnectedPeer(target);
        try {
          localStorage.setItem('internalChatPeer', target);
        } catch {}
      }
    } else {
      const saved = (() => {
        try {
          return localStorage.getItem('internalChatPeer') || '';
        } catch {
          return '';
        }
      })();
      if (saved) {
        setPeer(saved);
        setConnectedPeer(saved);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 未选择对话对象时，拉取会话列表，让用户看到"谁发来、发了什么"
  useEffect(() => {
    if (!myAddress || connectedPeer) {
      setConversations([]);
      return;
    }
    let active = true;
    setConversationsLoading(true);
    getInternalChatConversations(myAddress).then(result => {
      if (!active) return;
      if (result.success && result.conversations) {
        setConversations(result.conversations);
      }
    }).finally(() => {
      if (active) setConversationsLoading(false);
    });
    return () => { active = false; };
  }, [myAddress, connectedPeer]);

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

  // 导出聊天记录为文本文件（拉取完整历史）
  const handleExport = async () => {
    if (!myAddress || !connectedPeer || exporting) return;
    setExporting(true);
    try {
      const result = await getFullInternalChat(myAddress, connectedPeer);
      if (!result.success || !result.messages) {
        showErrorMessage(t('internalChat.exportFailed'));
        return;
      }
      const lines: string[] = [];
      lines.push(`=== ${t('internalChat.exportTitle')} ===`);
      lines.push(`${t('internalChat.myAddress')}: ${myAddress}`);
      lines.push(`${t('internalChat.peer')}: ${connectedPeer}`);
      lines.push('');
      for (const m of result.messages) {
        const time = new Intl.DateTimeFormat(undefined, {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        }).format(new Date(m.receivedAt * 1000));
        const sender = m.fromAddress === myAddress ? `${myAddress} (${t('internalChat.me')})` : connectedPeer;
        lines.push(`[${time}] ${sender}`);
        lines.push(m.textContent || '');
        lines.push('');
      }
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat_${myAddress}_${connectedPeer}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccessMessage(t('internalChat.exportSuccess'));
    } catch {
      showErrorMessage(t('internalChat.exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  // 清空聊天记录（按小时；0 表示全部）
  const handleClear = async (hours: number) => {
    if (!myAddress || !connectedPeer) return;
    const label = hours === 0
      ? t('internalChat.clearAllConfirm')
      : t('internalChat.clearHoursConfirm', { hours });
    if (!window.confirm(label)) return;

    setClearing(true);
    setShowClearMenu(false);
    try {
      const result = await clearInternalChat(myAddress, connectedPeer, hours);
      if (result.success) {
        setMessages([]);
        sinceRef.current = 0;
        showSuccessMessage(t('internalChat.clearSuccess'));
      } else {
        showErrorMessage(t('internalChat.clearFailed'));
      }
    } catch {
      showErrorMessage(t('internalChat.clearFailed'));
    } finally {
      setClearing(false);
    }
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
          <div className="flex-1 flex flex-col items-center justify-start min-h-[50vh] pt-6 text-center space-y-5">
            <div>
              <div className="text-5xl opacity-30 mb-4"><i className="fas fa-comments"></i></div>
              <h1 className="text-2xl font-bold mb-2">{t('internalChat.title')}</h1>
              <p className="text-muted-foreground text-sm max-w-md">{t('internalChat.intro')}</p>
              <p className="text-xs text-muted-foreground/70 mt-2">{t('internalChat.myAddress')}: <span className="font-mono text-primary">{myAddress}</span></p>
            </div>

            <div className="w-full max-w-xl text-left">
              <div className="flex items-center gap-2 mb-2 px-1">
                <h2 className="text-sm font-semibold text-muted-foreground">{t('internalChat.conversations')}</h2>
                {conversationsLoading && (
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary"></span>
                )}
              </div>
              {!conversationsLoading && conversations.length === 0 ? (
                <div className="bg-muted/40 rounded-xl px-4 py-6 text-center text-sm text-muted-foreground border">
                  {t('internalChat.noConversations')}
                </div>
              ) : (
                <div className="space-y-2 max-h-[35vh] overflow-y-auto">
                  {conversations.map(conv => (
                    <button
                      key={conv.peer}
                      onClick={() => {
                        setConnectedPeer(conv.peer);
                        setPeer(conv.peer);
                        try {
                          localStorage.setItem('internalChatPeer', conv.peer);
                        } catch {}
                        sinceRef.current = 0;
                        setMessages([]);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border bg-background hover:bg-muted/60 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate font-mono">{conv.peer}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{formatTime(conv.lastAt)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                            {conv.lastMessage || t('internalChat.empty')}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
            <div className="flex items-center justify-between py-4 border-b gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={resetChat}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors shrink-0"
                  title={t('internalChat.back')}
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <div className="min-w-0">
                  <div className="font-medium truncate">{connectedPeer}</div>
                  <div className="text-xs text-muted-foreground">{t('internalChat.online')}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">
                  {messages.length} {t('internalChat.messages')}
                </span>
                <button
                  onClick={handleExport}
                  disabled={exporting || messages.length === 0}
                  className="px-3 py-1.5 text-sm rounded-full bg-muted/60 hover:bg-muted/80 text-foreground hover:text-primary border border-border/60 hover:border-border flex items-center gap-1.5 disabled:opacity-50"
                  title={t('internalChat.export')}
                >
                  <i className="fas fa-download text-xs"></i>
                  <span className="hidden sm:inline">{exporting ? '...' : t('internalChat.export')}</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowClearMenu(v => !v)}
                    onBlur={() => setTimeout(() => setShowClearMenu(false), 150)}
                    disabled={clearing || messages.length === 0}
                    className="px-3 py-1.5 text-sm rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 hover:border-red-500 flex items-center gap-1.5 disabled:opacity-50"
                    title={t('internalChat.clear')}
                  >
                    <i className="fas fa-trash text-xs"></i>
                    <span className="hidden sm:inline">{clearing ? '...' : t('internalChat.clear')}</span>
                  </button>
                  {showClearMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-popover border shadow-xl z-50 py-1.5 overflow-hidden">
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-popover-foreground hover:bg-muted transition-colors"
                        onClick={() => handleClear(1)}
                      >
                        {t('internalChat.clear1h')}
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-popover-foreground hover:bg-muted transition-colors"
                        onClick={() => handleClear(24)}
                      >
                        {t('internalChat.clear24h')}
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                        onClick={() => handleClear(0)}
                      >
                        {t('internalChat.clearAll')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
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

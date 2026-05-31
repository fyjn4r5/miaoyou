import React, { useContext, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MailboxContext } from '../contexts/MailboxContext';
import EmailDetail from './EmailDetail';
import { generateRandomName } from '../utils/nameGenerator';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string | null) => void;
  isLoading: boolean;
}

const EmailList: React.FC<EmailListProps> = ({ 
  emails, 
  selectedEmailId, 
  onSelectEmail,
  isLoading 
}) => {
  const { t } = useTranslation();
  const { autoRefresh, setAutoRefresh, refreshEmails, mailbox, deleteMailbox, showSuccessMessage } = useContext(MailboxContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const randomName = useMemo(() => generateRandomName(), []);

  const copyToClipboard = async (text: string, messageKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccessMessage(t(messageKey));
    } catch {
      showSuccessMessage(t('common.copied'));
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const formatFullDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const calculateTimeLeft = (expiresAt: number) => {
    if (!expiresAt) return '';
    
    const now = Math.floor(Date.now() / 1000);
    const timeLeftSeconds = expiresAt - now;
    
    if (timeLeftSeconds <= 0) {
      return t('mailbox.expired');
    }
    
    const hours = Math.floor(timeLeftSeconds / 3600);
    const minutes = Math.floor((timeLeftSeconds % 3600) / 60);
    
    if (hours > 0) {
      return t('mailbox.expiresInTime', { hours, minutes });
    } else {
      return t('mailbox.expiresInMinutes', { minutes });
    }
  };
  
  const handleRefresh = () => {
    // feat: 调用 context 中的 refreshEmails，并传入 true 表示是手动刷新
    refreshEmails(true);
  };
  
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };
  
  const handleDeleteMailbox = async () => {
    if (window.confirm(t('mailbox.confirmDelete'))) {
      setIsDeleting(true);
      try {
        await deleteMailbox();
      } catch (error) {
        console.error('Error deleting mailbox:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  if (isLoading || isDeleting) {
    return (
      <div className="border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t('email.inbox')}</h2>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg">
      <div className="flex items-center gap-3 p-4 border-b flex-wrap">
        <h2 className="text-lg font-semibold whitespace-nowrap">{t('email.inbox')}</h2>
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="text-muted-foreground">
            {randomName.isMale ? '♂' : '♀'}
          </span>
          <span className="font-medium text-foreground whitespace-nowrap">{randomName.fullName}</span>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={() => copyToClipboard(randomName.firstName, 'email.copiedFirstName')}
            className="hover:text-primary cursor-pointer"
            title={t('email.copyFirstName')}
          >
            {t('email.firstName')}
          </button>
          <button
            onClick={() => copyToClipboard(randomName.lastName, 'email.copiedLastName')}
            className="hover:text-primary cursor-pointer"
            title={t('email.copyLastName')}
          >
            {t('email.lastName')}
          </button>
          <button
            onClick={() => copyToClipboard(randomName.fullName, 'email.copiedFullName')}
            className="hover:text-primary cursor-pointer"
            title={t('email.copyFullName')}
          >
            {t('email.fullName')}
          </button>
          <button
            onClick={() => copyToClipboard(randomName.username, 'email.copiedUsername')}
            className="hover:text-primary cursor-pointer"
            title={t('email.copyUsername')}
          >
            {t('email.username')}
          </button>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={handleRefresh}
            className="p-1 rounded-md hover:bg-muted"
            title={t('email.refresh')}
          >
            <i className="fas fa-sync-alt text-sm"></i>
          </button>
          <button
            onClick={toggleAutoRefresh}
            className={`p-1 rounded-md ${autoRefresh ? 'text-primary' : 'text-muted-foreground'}`}
            title={autoRefresh ? t('email.autoRefreshOn') : t('email.autoRefreshOff')}
          >
            <i className="fas fa-clock text-sm"></i>
          </button>
        </div>
      </div>

      {mailbox && (
        <div className="px-4 py-2 bg-muted/30 border-b text-xs text-muted-foreground">
          <div className="flex justify-between items-center mb-1">
            <span>{t('mailbox.created')}:</span>
            <span>{formatFullDate(mailbox.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>{t('mailbox.expiresAt')}:</span>
            <span>{formatFullDate(mailbox.expiresAt)}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span>{t('mailbox.timeLeft')}:</span>
            <span>{calculateTimeLeft(mailbox.expiresAt)}</span>
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={handleDeleteMailbox}
              className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
              title={t('mailbox.delete')}
            >
              <i className="fas fa-trash-alt"></i>
              <span>{t('mailbox.delete')}</span>
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center px-4 py-2 bg-muted/30">
        <span className="text-sm text-muted-foreground">
          {emails.length} {emails.length === 1 ? t('email.message') : t('email.messages')}
        </span>
        <span className="text-xs text-muted-foreground">
          {autoRefresh ? t('email.autoRefreshOn') : t('email.autoRefreshOff')}
        </span>
      </div>
      
      {emails.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground">
          <p>{t('email.emptyInbox')}</p>
          <p className="text-sm mt-2">{t('email.waitingForEmails')}</p>
        </div>
      ) : (
        <ul className="divide-y">
          {emails.map((email) => (
            <React.Fragment key={email.id}>
              <li 
                className={`p-4 cursor-pointer hover:bg-muted/50 ${
                  selectedEmailId === email.id ? 'bg-muted' : ''
                } ${!email.isRead ? 'font-semibold' : ''}`}
                onClick={() => onSelectEmail(selectedEmailId === email.id ? null : email.id)}
              >
                <div className="flex justify-between mb-1">
                  <span className="truncate">{email.fromName || email.fromAddress}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDate(email.receivedAt)}
                  </span>
                </div>
                <div className="text-sm truncate">
                  {email.subject || t('email.noSubject')}
                </div>
              </li>
              {selectedEmailId === email.id && (
                <li className="border-t border-muted">
                  <EmailDetail 
                    emailId={email.id} 
                    onClose={() => onSelectEmail(null)}
                  />
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmailList; 
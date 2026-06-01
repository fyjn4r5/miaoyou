import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MailboxContext } from '../contexts/MailboxContext';
import EmailDetail from './EmailDetail';
import UserInfoModal from './UserInfoModal';
import { generateRandomName } from '../utils/nameGenerator';
import { COUNTRIES } from '../utils/countryData';

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
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [randomName, setRandomName] = useState(() => generateRandomName("US"));

  const regenerateName = (countryCode?: string) => {
    setRandomName(generateRandomName(countryCode || selectedCountry));
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setRandomName(generateRandomName(countryCode));
  };

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
    refreshEmails(true);
  };
  
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };
  
  
  if (isLoading || isDeleting) {
    return (
      <div className="border rounded-xl shadow-sm p-6">
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
    <>
    <div className="border rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-5 border-b bg-card gap-3">
        <h2 className="text-xl font-bold">{t('email.inbox')}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => copyToClipboard(randomName.firstName, 'email.copiedFirstName')}
            className="px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-primary flex items-center gap-1.5 border text-sm font-medium transition-all hover:shadow-sm"
            title={t('email.copyFirstName')}
          >
            <span className="text-muted-foreground">{t('email.firstName')}:</span>
            <span className="text-foreground font-semibold">{randomName.firstName}</span>
            <i className="fas fa-copy text-xs opacity-50"></i>
          </button>
          <button
            onClick={() => copyToClipboard(randomName.lastName, 'email.copiedLastName')}
            className="px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-primary flex items-center gap-1.5 border text-sm font-medium transition-all hover:shadow-sm"
            title={t('email.copyLastName')}
          >
            <span className="text-muted-foreground">{t('email.lastName')}:</span>
            <span className="text-foreground font-semibold">{randomName.lastName}</span>
            <i className="fas fa-copy text-xs opacity-50"></i>
          </button>
          <button
            onClick={() => copyToClipboard(randomName.username, 'email.copiedUsername')}
            className="px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-primary flex items-center gap-1.5 border text-sm font-medium transition-all hover:shadow-sm"
            title={t('email.copyUsername')}
          >
            <span className="text-muted-foreground">{t('email.username')}:</span>
            <span className="text-foreground font-semibold">{randomName.username}</span>
            <i className="fas fa-copy text-xs opacity-50"></i>
          </button>
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-primary flex items-center gap-1.5 border text-sm font-medium transition-all hover:shadow-sm"
            title={t('email.showMore')}
          >
            <i className="fas fa-ellipsis-h text-xs"></i>
            <span>{t('email.showMore')}</span>
          </button>
        </div>

      </div>

      {mailbox && (
        <div className="px-5 py-3 bg-muted/20 border-b text-sm text-muted-foreground">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex justify-between sm:flex-col sm:gap-0.5">
              <span className="font-medium">{t('mailbox.created')}</span>
              <span>{formatFullDate(mailbox.createdAt)}</span>
            </div>
            <div className="flex justify-between sm:flex-col sm:gap-0.5">
              <span className="font-medium">{t('mailbox.expiresAt')}</span>
              <span>{formatFullDate(mailbox.expiresAt)}</span>
            </div>
            <div className="flex justify-between sm:flex-col sm:gap-0.5">
              <span className="font-medium">{t('mailbox.timeLeft')}</span>
              <span className="flex items-center gap-2">
                <span className={mailbox.expiresAt - Math.floor(Date.now() / 1000) < 3600 ? 'text-red-500 font-semibold' : ''}>{calculateTimeLeft(mailbox.expiresAt)}</span>
                <div className="flex items-center">
                  <button
                    onClick={handleRefresh}
                    className="px-3 py-1.5 rounded-l-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-primary flex items-center gap-1.5 border border-r-0 text-sm font-medium transition-all"
                    title={t('email.refresh')}
                  >
                    <i className="fas fa-sync-alt text-xs"></i>
                    <span>{t('email.refresh')}</span>
                  </button>
                  <button
                    onClick={toggleAutoRefresh}
                    className={`px-2.5 py-1.5 rounded-r-md border text-sm font-medium transition-all flex items-center ${
                      autoRefresh
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-primary border-border'
                    }`}
                    title={autoRefresh ? t('email.autoRefreshOn') : t('email.autoRefreshOff')}
                  >
                    <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </button>
                </div>
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center px-5 py-3 bg-muted/20">
        <span className="text-sm font-medium text-muted-foreground">
          {emails.length} {emails.length === 1 ? t('email.message') : t('email.messages')}
        </span>
      </div>
      
      {emails.length === 0 ? (
        <div className="p-10 text-center text-muted-foreground">
          <div className="text-5xl mb-4 opacity-20"><i className="fas fa-envelope-open-text"></i></div>
          <p className="text-lg font-medium">{t('email.emptyInbox')}</p>
          <p className="text-sm mt-2">{t('email.waitingForEmails')}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border/50">
          {emails.map((email) => (
            <React.Fragment key={email.id}>
              <li 
                className={`px-5 py-4 cursor-pointer transition-colors ${
                  selectedEmailId === email.id ? 'bg-primary/5' : 'hover:bg-muted/40'
                } ${!email.isRead ? 'bg-primary/[0.02] border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                onClick={() => onSelectEmail(selectedEmailId === email.id ? null : email.id)}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`truncate ${!email.isRead ? 'font-bold text-foreground' : 'text-foreground'}`}>
                    {!email.isRead && <span className="w-2 h-2 rounded-full bg-primary inline-block mr-2"></span>}
                    {email.fromName || email.fromAddress}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 tabular-nums">
                    {formatDate(email.receivedAt)}
                  </span>
                </div>
                <div className={`text-sm truncate ${!email.isRead ? 'font-medium' : 'text-muted-foreground'}`}>
                  {email.subject || <span className="italic opacity-60">{t('email.noSubject')}</span>}
                </div>
              </li>
              {selectedEmailId === email.id && (
                <li className="border-t border-border/50 bg-muted/10">
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
      <UserInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        randomName={randomName}
        countries={COUNTRIES}
        selectedCountry={selectedCountry}
        onCountryChange={handleCountryChange}
        onRegenerate={regenerateName}
      />
    </>
  );
};

export default EmailList;

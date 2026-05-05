import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { MailboxContext } from '../contexts/MailboxContext';
import CreateLoginDialog from './CreateLoginDialog';

interface HeaderMailboxProps {
  mailbox: Mailbox | null;
  onMailboxChange: (mailbox: Mailbox) => void;
  isLoading: boolean;
}

const HeaderMailbox: React.FC<HeaderMailboxProps> = ({ 
  mailbox, 
  onMailboxChange,
  isLoading
}) => {
  const { t } = useTranslation();
  const { showSuccessMessage, showErrorMessage, mailbox: currentMailbox, showPasswordDialog, setShowPasswordDialog, selectedDomain } = useContext(MailboxContext);

  if (!mailbox || isLoading) {
    return (
      <button
        onClick={() => setShowPasswordDialog(true)}
        className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
      >
        <i className="fas fa-sign-in-alt mr-2"></i>
        {t('mailbox.login')} / {t('mailbox.create')}
      </button>
    );
  }

  const copyToClipboard = () => {
    const fullAddress = mailbox.address.includes('@') ? mailbox.address : `${mailbox.address}@${selectedDomain}`;
    navigator.clipboard.writeText(fullAddress)
      .then(() => showSuccessMessage(t('mailbox.copySuccess')))
      .catch(() => showErrorMessage(t('mailbox.copyFailed')));
  };

  const handleCreateOrSwitch = () => {
    setShowPasswordDialog(true);
  };

  const copyPassword = () => {
    if (currentMailbox?.password) {
      navigator.clipboard.writeText(currentMailbox.password)
        .then(() => showSuccessMessage(t('mailbox.copyPasswordSuccess')))
        .catch(() => showErrorMessage(t('mailbox.copyPasswordFailed')));
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <code className="hidden sm:block bg-muted px-2 py-1 rounded text-sm font-medium">
          {mailbox.address.includes('@') ? mailbox.address : `${mailbox.address}@${selectedDomain}`}
        </code>
        
        <button onClick={copyToClipboard} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-primary/20 hover:text-primary transition-colors" title={t('common.copy')}>
          <i className="fas fa-copy text-sm"></i>
        </button>
        
        <button onClick={handleCreateOrSwitch} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-primary/20 hover:text-primary transition-colors" title={t('mailbox.create')}>
          <i className="fas fa-plus text-sm"></i>
        </button>

        {currentMailbox?.password && (
          <div className="flex items-center space-x-1 ml-2 pl-2 border-l border-muted-foreground/20">
            <button onClick={copyPassword} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-primary/20 hover:text-primary transition-colors" title={t('mailbox.copyPassword')}>
              <i className="fas fa-key text-xs"></i>
            </button>
          </div>
        )}
      </div>

      <CreateLoginDialog isOpen={showPasswordDialog} onDismiss={() => setShowPasswordDialog(false)} />
    </>
  );
};

export default HeaderMailbox;

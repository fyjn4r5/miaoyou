import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { MailboxContext } from '../contexts/MailboxContext';
import CreateLoginDialog from './CreateLoginDialog';
import MailboxSwitcher from './MailboxSwitcher';

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
  const { showSuccessMessage, showErrorMessage, mailbox: currentMailbox, showPasswordDialog, setShowPasswordDialog, selectedDomain, logout } = useContext(MailboxContext);

  const fullAddress = mailbox ? (mailbox.address.includes('@') ? mailbox.address : `${mailbox.address}@${selectedDomain}`) : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullAddress)
      .then(() => showSuccessMessage(t('mailbox.copySuccess')))
      .catch(() => showErrorMessage(t('mailbox.copyFailed')));
  };

  const handleCreateNew = () => {
    setShowPasswordDialog(true);
  };

  return (
    <>
      <div className="flex items-center space-x-1">
        <MailboxSwitcher
          currentMailbox={mailbox}
          onSwitchMailbox={(m) => onMailboxChange(m)}
          domain={selectedDomain}
        />
        {!mailbox || isLoading ? (
          <button
            onClick={() => setShowPasswordDialog(true)}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            <i className="fas fa-envelope mr-2"></i>
            {t('mailbox.login')} / {t('mailbox.create')}
          </button>
        ) : (
          <>
            <code className="hidden md:block bg-muted px-2 py-1 rounded text-sm font-medium">
              {fullAddress}
            </code>
        
            <button onClick={copyToClipboard} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-primary/20 hover:text-primary transition-colors" title={t('mailbox.copyMailbox')}>
              <i className="fas fa-copy text-sm"></i>
            </button>

            <button onClick={handleCreateNew} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-primary/20 hover:text-primary transition-colors" title={t('mailbox.createNew')}>
              <i className="fas fa-plus text-sm"></i>
            </button>

            <button onClick={logout} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-primary/20 hover:text-primary transition-colors" title={t('mailbox.logout')}>
              <i className="fas fa-sign-out-alt text-sm"></i>
            </button>
          </>
        )}
      </div>

      <CreateLoginDialog isOpen={showPasswordDialog} onDismiss={() => setShowPasswordDialog(false)} />
    </>
  );
};

export default HeaderMailbox;

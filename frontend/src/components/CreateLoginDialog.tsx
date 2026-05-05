import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { MailboxContext } from '../contexts/MailboxContext';
import { generateRandomAddress, generatePassword } from '../utils/helpers';

interface CreateLoginDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const CreateLoginDialog: React.FC<CreateLoginDialogProps> = ({ isOpen, onDismiss }) => {
  const { t } = useTranslation();
  const { loginWithPassword, isLoading, createMailboxWithCredentials, showSuccessMessage, showErrorMessage, emailDomains, selectedDomain, setSelectedDomain } = useContext(MailboxContext);
  const [activeTab, setActiveTab] = useState<'create' | 'login'>('create');

  const [generatedAddress, setGeneratedAddress] = useState(() => generateRandomAddress());
  const [generatedPassword, setGeneratedPassword] = useState(() => generatePassword());
  const [copiedAll, setCopiedAll] = useState(false);
  
  const [loginFullAddress, setLoginFullAddress] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  if (!isOpen) return null;

  const handleRegenerate = () => {
    setGeneratedAddress(generateRandomAddress());
    setGeneratedPassword(generatePassword());
  };

  const handleCopyAll = () => {
    const siteUrl = window.location.origin;
    const text = `永久匿名邮箱：\n${siteUrl}\n用户名：\n${generatedAddress}@${selectedDomain}\n密码：\n${generatedPassword}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const handleCreate = async () => {
    const fullAddress = `${generatedAddress}@${selectedDomain}`;
    const result = await createMailboxWithCredentials(fullAddress, generatedPassword);
    if (result) {
      handleCopyAll();
      setTimeout(() => {
        onDismiss();
      }, 1000);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginFullAddress.trim() || !loginPassword.trim()) {
      setLoginError(t('mailbox.loginRequiredFields'));
      return;
    }

    const success = await loginWithPassword(loginFullAddress.trim(), loginPassword);
    if (success) {
      setLoginFullAddress('');
      setLoginPassword('');
      onDismiss();
    } else {
      setLoginError(t('mailbox.loginFailed'));
    }
  };

  const handleTabSwitch = (tab: 'create' | 'login') => {
    setActiveTab(tab);
    setLoginError('');
    setCopiedAll(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {t('app.title')}
          </h2>
          <button
            onClick={onDismiss}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex border-b mb-4">
          <button
            data-tab="create"
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              activeTab === 'create' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleTabSwitch('create')}
          >
            {t('mailbox.create')}
          </button>
          <button
            data-tab="login"
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              activeTab === 'login' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleTabSwitch('login')}
          >
            {t('mailbox.login')}
          </button>
        </div>

        {activeTab === 'create' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-md p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('mailbox.address')}
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-background rounded-md px-3 py-2 text-sm font-mono whitespace-nowrap overflow-hidden text-ellipsis" title={generatedAddress}>
                    {generatedAddress}
                  </code>
                  <span className="text-muted-foreground">@</span>
                  <select 
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    {emailDomains.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('mailbox.password')}
                </label>
                <code className="block bg-background rounded-md px-3 py-2 text-sm font-mono whitespace-nowrap overflow-hidden text-ellipsis" title={generatedPassword}>
                  {generatedPassword}
                </code>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleRegenerate}
                className="flex-1 px-4 py-2 text-sm rounded-md bg-muted hover:bg-muted/80 transition-colors"
                disabled={isLoading}
              >
                <i className="fas fa-sync-alt mr-1"></i>
                {t('mailbox.refresh')}
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span><i className="fas fa-spinner fa-spin mr-1"></i>{t('common.loading')}</span>
                ) : copiedAll ? (
                  <span><i className="fas fa-clipboard-check mr-1"></i>已复制，请粘贴保存</span>
                ) : (
                  <span><i className="fas fa-plus mr-1"></i>{t('mailbox.createNew')}</span>
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {t('mailbox.createPasswordTip')}
            </p>
          </div>
        )}

        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('mailbox.address')}
              </label>
              <input
                type="text"
                value={loginFullAddress}
                onChange={(e) => setLoginFullAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder={`${t('mailbox.address')} (如: abc123456789@example.com)`}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('mailbox.password')}
              </label>
              <input
                type="text"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder={t('mailbox.password')}
                disabled={isLoading}
              />
            </div>

            {loginError && (
              <div className="text-red-500 text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <span><i className="fas fa-spinner fa-spin mr-1"></i>{t('common.loading')}</span>
              ) : (
                <span><i className="fas fa-sign-in-alt mr-1"></i>{t('mailbox.login')}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateLoginDialog;

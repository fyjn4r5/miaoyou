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
  const { loginWithPassword, isLoading, createMailboxWithCredentials, showSuccessMessage, showErrorMessage } = useContext(MailboxContext);
  const [activeTab, setActiveTab] = useState<'create' | 'login'>('create');
  
  // 创建标签状态
  const [generatedAddress, setGeneratedAddress] = useState(() => generateRandomAddress());
  const [generatedPassword, setGeneratedPassword] = useState(() => generatePassword());
  const [createdCopied, setCreatedCopied] = useState(false);
  
  // 登录标签状态
  const [loginAddress, setLoginAddress] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  if (!isOpen) return null;

  const handleRegenerate = () => {
    setGeneratedAddress(generateRandomAddress());
    setGeneratedPassword(generatePassword());
  };

  const handleCopyCreate = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCreatedCopied(true);
      setTimeout(() => setCreatedCopied(false), 2000);
    });
  };

  const handleCreate = async () => {
    const result = await createMailboxWithCredentials(generatedAddress, generatedPassword);
    if (result) {
      onDismiss();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginAddress.trim() || !loginPassword.trim()) {
      setLoginError(t('mailbox.loginRequiredFields'));
      return;
    }

    const success = await loginWithPassword(loginAddress.trim(), loginPassword);
    if (success) {
      setLoginAddress('');
      setLoginPassword('');
      onDismiss();
    } else {
      setLoginError(t('mailbox.loginFailed'));
    }
  };

  const handleTabSwitch = (tab: 'create' | 'login') => {
    setActiveTab(tab);
    setLoginError('');
    setCreatedCopied(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        {/* 标题 */}
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

        {/* 标签页切换 */}
        <div className="flex border-b mb-4">
          <button
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

        {/* 创建标签 */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-md p-4 space-y-3">
              {/* 邮箱地址 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('mailbox.address')}
                </label>
                <div className="flex items-center bg-background rounded-md px-3 py-2">
                  <code className="flex-1 text-sm break-all font-mono">{generatedAddress}</code>
                  <button
                    onClick={() => handleCopyCreate(generatedAddress)}
                    className="ml-2 w-8 h-8 flex items-center justify-center rounded-md hover:bg-primary/20 hover:text-primary transition-colors"
                    title={t('common.copy')}
                  >
                    <i className="fas fa-copy text-sm"></i>
                  </button>
                </div>
              </div>

              {/* 密码 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('mailbox.password')}
                </label>
                <div className="flex items-center bg-background rounded-md px-3 py-2">
                  <code className="flex-1 text-sm break-all font-mono">{generatedPassword}</code>
                  <button
                    onClick={() => handleCopyCreate(generatedPassword)}
                    className="ml-2 w-8 h-8 flex items-center justify-center rounded-md hover:bg-primary/20 hover:text-primary transition-colors"
                    title={t('common.copy')}
                  >
                    <i className="fas fa-copy text-sm"></i>
                  </button>
                </div>
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
                ) : (
                  <span><i className="fas fa-plus mr-1"></i>{t('mailbox.create')}</span>
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {t('mailbox.createPasswordTip')}
            </p>
          </div>
        )}

        {/* 登录标签 */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('mailbox.address')}
              </label>
              <input
                type="text"
                value={loginAddress}
                onChange={(e) => setLoginAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder={t('mailbox.address')}
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

import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MailboxContext } from '../contexts/MailboxContext';
import { generateRandomAddress, generatePassword } from '../utils/helpers';
import { getEmailDomains, getDefaultEmailDomain, EMAIL_DOMAINS, DEFAULT_EMAIL_DOMAIN } from '../config';

interface CreateLoginDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const CreateLoginDialog: React.FC<CreateLoginDialogProps> = ({ isOpen, onDismiss }) => {
  const { t } = useTranslation();
  const { loginWithPassword, isLoading, createMailboxWithCredentials, showSuccessMessage, showErrorMessage } = useContext(MailboxContext);
  const [activeTab, setActiveTab] = useState<'create' | 'login'>('create');
  
  // Domain state
  const [emailDomains, setEmailDomains] = useState<string[]>(EMAIL_DOMAINS);
  const [selectedDomain, setSelectedDomain] = useState<string>(DEFAULT_EMAIL_DOMAIN);
  
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const domains = await getEmailDomains();
        const defaultDom = await getDefaultEmailDomain();
        setEmailDomains(domains.length > 0 ? domains : EMAIL_DOMAINS);
        setSelectedDomain(defaultDom || DEFAULT_EMAIL_DOMAIN);
      } catch (error) {
        console.error('加载域名配置失败:', error);
      }
    };
    loadConfig();
  }, []);

  // 创建标签状态
  const [generatedAddress, setGeneratedAddress] = useState(() => generateRandomAddress());
  const [generatedPassword, setGeneratedPassword] = useState(() => generatePassword());
  const [copiedAll, setCopiedAll] = useState(false);
  
  // 登录标签状态
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
    const text = `用户名：\n${generatedAddress}@${selectedDomain}\n密码：\n${generatedPassword}\n永久匿名邮箱：\n${siteUrl}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const handleCreate = async () => {
    const fullAddress = `${generatedAddress}@${selectedDomain}`;
    const result = await createMailboxWithCredentials(fullAddress, generatedPassword);
    if (result) {
      onDismiss();
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

        {/* 创建标签 */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-md p-4 space-y-3">
              {/* 邮箱用户名 + 域名选择（一排） */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('mailbox.address')}
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-background rounded-md px-3 py-2 text-sm break-all font-mono">
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

              {/* 密码 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('mailbox.password')}
                </label>
                <code className="block bg-background rounded-md px-3 py-2 text-sm break-all font-mono">
                  {generatedPassword}
                </code>
              </div>
            </div>

            {/* 复制按钮（放在下方） */}
            <button
              onClick={handleCopyAll}
              className="w-full px-4 py-2 text-sm rounded-md bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center"
            >
              <i className={`fas ${copiedAll ? 'fa-check text-green-500' : 'fa-copy'} mr-2`}></i>
              {copiedAll ? (t('common.copied') || '已复制') : (t('mailbox.copyAll') || '复制用户名和密码')}
            </button>

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

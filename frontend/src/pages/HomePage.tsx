import React, { useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import EmailList from '../components/EmailList';
import { MailboxContext } from '../contexts/MailboxContext';
import Container from '../components/Container';
import CreateLoginDialog from '../components/CreateLoginDialog';

// 添加结构化数据组件
const StructuredData: React.FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "秒邮-永久匿名邮箱",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CNY"
    },
    "description": "创建永久邮箱地址，接收邮件，支持密码登录找回，保护您的隐私安全",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1024"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { 
    mailbox, 
    isLoading, 
    emails, 
    selectedEmail, 
    setSelectedEmail, 
    isEmailsLoading,
    showPasswordDialog,
    setShowPasswordDialog
  } = useContext(MailboxContext);
  
  const handlingNotFoundRef = useRef(false);
  
  if (isLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <StructuredData />
      <CreateLoginDialog isOpen={showPasswordDialog} onDismiss={() => setShowPasswordDialog(false)} />
      {mailbox && (
        <EmailList 
          emails={emails} 
          selectedEmailId={selectedEmail}
          onSelectEmail={setSelectedEmail}
          isLoading={isEmailsLoading}
        />
      )}
      
      {/* 未登录时的操作区域 */}
      {!mailbox && (
        <div className="mt-6 mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setShowPasswordDialog(true)}
            className="w-full sm:w-auto px-8 py-3 text-base rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <i className="fas fa-plus mr-2"></i>
            {t('mailbox.create')}
          </button>
          <button
            onClick={() => {
              setShowPasswordDialog(true);
              setTimeout(() => {
                const loginTab = document.querySelector('[data-tab="login"]');
                if (loginTab) (loginTab as HTMLElement).click();
              }, 100);
            }}
            className="w-full sm:w-auto px-8 py-3 text-base rounded-lg bg-muted hover:bg-muted/80 transition-colors font-medium"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            {t('mailbox.login')}
          </button>
        </div>
      )}
      
      {/* 介绍内容区域 */}
      <div className="mt-8 space-y-6">
        {/* 功能介绍 */}
        <section className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">{t('intro.features.title')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <i className="fas fa-shield-alt text-primary mt-1"></i>
                <div>
                  <h3 className="font-medium">{t('intro.features.privacy.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('intro.features.privacy.description')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-infinity text-primary mt-1"></i>
                <div>
                  <h3 className="font-medium">{t('intro.features.permanent.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('intro.features.permanent.description')}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <i className="fas fa-user-secret text-primary mt-1"></i>
                <div>
                  <h3 className="font-medium">{t('intro.features.anonymous.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('intro.features.anonymous.description')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-key text-primary mt-1"></i>
                <div>
                  <h3 className="font-medium">{t('intro.features.secure.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('intro.features.secure.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 使用场景 */}
        <section className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">{t('intro.useCases.title')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
               <i className="fas fa-check-circle text-2xl text-primary mb-3"></i>
               <h3 className="font-medium mb-2">{t('intro.useCases.verification.title')}</h3>
               <p className="text-sm text-muted-foreground">{t('intro.useCases.verification.description')}</p>
             </div>
            <div className="text-center p-4">
              <i className="fas fa-download text-2xl text-primary mb-3"></i>
              <h3 className="font-medium mb-2">{t('intro.useCases.downloads.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('intro.useCases.downloads.description')}</p>
            </div>
            <div className="text-center p-4">
              <i className="fas fa-user-shield text-2xl text-primary mb-3"></i>
              <h3 className="font-medium mb-2">{t('intro.useCases.privacy.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('intro.useCases.privacy.description')}</p>
            </div>
          </div>
        </section>

        {/* 安全提示 */}
        <section className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">{t('intro.security.title')}</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <i className="fas fa-exclamation-triangle text-yellow-500 mt-1"></i>
              <p className="text-sm text-muted-foreground">{t('intro.security.warning1')}</p>
            </div>
            <div className="flex items-start space-x-3">
              <i className="fas fa-info-circle text-blue-500 mt-1"></i>
              <p className="text-sm text-muted-foreground">{t('intro.security.warning2')}</p>
            </div>
            <div className="flex items-start space-x-3">
              <i className="fas fa-trash-alt text-red-500 mt-1"></i>
              <p className="text-sm text-muted-foreground">{t('intro.security.warning3')}</p>
            </div>
          </div>
        </section>

        {/* 常见问题 */}
        <section className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">{t('intro.faq.title')}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{t('intro.faq.q1.question')}</h3>
              <p className="text-sm text-muted-foreground">{t('intro.faq.q1.answer')}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">{t('intro.faq.q2.question')}</h3>
              <p className="text-sm text-muted-foreground">{t('intro.faq.q2.answer')}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">{t('intro.faq.q3.question')}</h3>
              <p className="text-sm text-muted-foreground">{t('intro.faq.q3.answer')}</p>
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
};

export default HomePage;
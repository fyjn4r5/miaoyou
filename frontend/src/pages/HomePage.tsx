import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmailList from '../components/EmailList';
import { MailboxContext } from '../contexts/MailboxContext';
import Container from '../components/Container';
import CreateLoginDialog from '../components/CreateLoginDialog';

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

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        className="w-full py-4 flex items-center justify-between text-left hover:text-primary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{question}</span>
        <i className={`fas fa-chevron-down transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      {isOpen && (
        <div className="pb-4 text-muted-foreground">
          {answer}
        </div>
      )}
    </div>
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
  
  if (isLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }
  
  const openLogin = () => {
    setShowPasswordDialog(true);
    setTimeout(() => {
      const loginTab = document.querySelector('[data-tab="login"]');
      if (loginTab) (loginTab as HTMLElement).click();
    }, 100);
  };
  
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
      
      {!mailbox && (
        <div className="space-y-12 py-6">
          {/* Hero 区域 */}
          <section className="text-center space-y-6 py-10">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {t('intro.hero.title')}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t('intro.hero.subtitle')}
              </p>
            </div>
            
            {/* 统计徽章 */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className="px-5 py-2.5 rounded-full bg-primary/10 text-primary font-medium text-sm">
                <i className="fas fa-infinity mr-1.5"></i>
                {t('intro.hero.stats.permanent')}
              </div>
              <div className="px-5 py-2.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium text-sm">
                <i className="fas fa-key mr-1.5"></i>
                {t('intro.hero.stats.secure')}
              </div>
              <div className="px-5 py-2.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium text-sm">
                <i className="fas fa-user-secret mr-1.5"></i>
                {t('intro.hero.stats.anonymous')}
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowPasswordDialog(true)}
                className="w-full sm:w-auto px-8 py-3 text-base rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 font-medium"
              >
                <i className="fas fa-plus mr-2"></i>
                {t('intro.hero.createBtn')}
              </button>
              <button
                onClick={openLogin}
                className="w-full sm:w-auto px-8 py-3 text-base rounded-xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-lg font-medium"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                {t('intro.hero.loginBtn')}
              </button>
            </div>
          </section>
          
          {/* 功能介绍 */}
          <section>
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold mb-1.5">{t('intro.features.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('intro.features.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-card rounded-xl p-5 border hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <i className="fas fa-shield-alt text-2xl text-primary"></i>
                </div>
                <h3 className="font-semibold mb-1.5">{t('intro.features.privacy.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('intro.features.privacy.description')}</p>
              </div>
              <div className="bg-card rounded-xl p-5 border hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                  <i className="fas fa-infinity text-2xl text-green-500"></i>
                </div>
                <h3 className="font-semibold mb-1.5">{t('intro.features.permanent.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('intro.features.permanent.description')}</p>
              </div>
              <div className="bg-card rounded-xl p-5 border hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                  <i className="fas fa-user-secret text-2xl text-purple-500"></i>
                </div>
                <h3 className="font-semibold mb-1.5">{t('intro.features.anonymous.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('intro.features.anonymous.description')}</p>
              </div>
              <div className="bg-card rounded-xl p-5 border hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                  <i className="fas fa-key text-2xl text-orange-500"></i>
                </div>
                <h3 className="font-semibold mb-1.5">{t('intro.features.secure.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('intro.features.secure.description')}</p>
              </div>
            </div>
          </section>
          
          {/* 使用场景 */}
          <section>
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold mb-1.5">{t('intro.useCases.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('intro.useCases.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              <div className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-xl p-5 border text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-check-circle text-xl text-blue-500"></i>
                </div>
                <h3 className="font-semibold mb-1.5">{t('intro.useCases.verification.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('intro.useCases.verification.description')}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-xl p-5 border text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-download text-xl text-green-500"></i>
                </div>
                <h3 className="font-semibold mb-1.5">{t('intro.useCases.downloads.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('intro.useCases.downloads.description')}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/5 to-purple-600/5 rounded-xl p-5 border text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-user-shield text-xl text-purple-500"></i>
                </div>
                <h3 className="font-semibold mb-1.5">{t('intro.useCases.privacy.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('intro.useCases.privacy.description')}</p>
              </div>
            </div>
          </section>
          
          {/* 安全提示 */}
          <section>
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold mb-1.5">{t('intro.security.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('intro.security.subtitle')}</p>
            </div>
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5 space-y-3">
              <div className="flex items-start space-x-3">
                <i className="fas fa-exclamation-triangle text-yellow-500 mt-0.5 flex-shrink-0"></i>
                <p className="text-sm leading-relaxed">{t('intro.security.warning1')}</p>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-info-circle text-blue-500 mt-0.5 flex-shrink-0"></i>
                <p className="text-sm leading-relaxed">{t('intro.security.warning2')}</p>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-trash-alt text-red-500 mt-0.5 flex-shrink-0"></i>
                <p className="text-sm leading-relaxed">{t('intro.security.warning3')}</p>
              </div>
            </div>
          </section>
          
          {/* FAQ */}
          <section>
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold mb-1.5">{t('intro.faq.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('intro.faq.subtitle')}</p>
            </div>
            <div className="bg-card rounded-xl border p-5 max-w-3xl mx-auto">
              <FAQItem question={t('intro.faq.q1.question')} answer={t('intro.faq.q1.answer')} />
              <FAQItem question={t('intro.faq.q2.question')} answer={t('intro.faq.q2.answer')} />
              <FAQItem question={t('intro.faq.q3.question')} answer={t('intro.faq.q3.answer')} />
            </div>
          </section>
        </div>
      )}
    </Container>
  );
};

export default HomePage;

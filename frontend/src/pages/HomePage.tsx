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

const StepCard: React.FC<{ step: string; title: string; description: string; icon: string; color: string }> = ({ step, title, description, icon, color }) => (
  <div className="flex flex-col items-center text-center">
    <div className={`w-20 h-20 rounded-2xl ${color} flex items-center justify-center mb-4 relative`}>
      <i className={`fas ${icon} text-3xl`}></i>
      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
        {step}
      </span>
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-base text-muted-foreground leading-relaxed max-w-xs">{description}</p>
  </div>
);

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
        <div className="text-center space-y-8 py-16">
          <div className="space-y-5">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t('intro.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('intro.hero.subtitle')}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 rounded-full bg-primary/10 text-primary font-semibold text-base">
              <i className="fas fa-infinity mr-2"></i>
              {t('intro.hero.stats.permanent')}
            </div>
            <div className="px-6 py-3 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-semibold text-base">
              <i className="fas fa-key mr-2"></i>
              {t('intro.hero.stats.secure')}
            </div>
            <div className="px-6 py-3 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-base">
              <i className="fas fa-user-secret mr-2"></i>
              {t('intro.hero.stats.anonymous')}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setShowPasswordDialog(true)}
              className="w-full sm:w-auto px-12 py-4 text-xl rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-2xl hover:shadow-primary/30 font-semibold"
            >
              <i className="fas fa-plus mr-2"></i>
              {t('intro.hero.createBtn')}
            </button>
            <button
              onClick={openLogin}
              className="w-full sm:w-auto px-12 py-4 text-xl rounded-2xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-xl font-semibold"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              {t('intro.hero.loginBtn')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-20 py-10">
          {/* 功能介绍 - 2行2列 */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('intro.features.title')}</h2>
              <p className="text-lg text-muted-foreground">{t('intro.features.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl p-8 border hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-shield-alt text-3xl text-primary"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{t('intro.features.privacy.title')}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">{t('intro.features.privacy.description')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-2xl p-8 border hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-infinity text-3xl text-green-500"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{t('intro.features.permanent.title')}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">{t('intro.features.permanent.description')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-2xl p-8 border hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-user-secret text-3xl text-purple-500"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{t('intro.features.anonymous.title')}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">{t('intro.features.anonymous.description')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-2xl p-8 border hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-key text-3xl text-orange-500"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{t('intro.features.secure.title')}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">{t('intro.features.secure.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* 使用步骤 */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('intro.steps.title')}</h2>
              <p className="text-lg text-muted-foreground">{t('intro.steps.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              <StepCard 
                step="1" 
                title={t('intro.steps.step1.title')} 
                description={t('intro.steps.step1.description')} 
                icon="fa-plus-circle" 
                color="bg-primary/10" 
              />
              <StepCard 
                step="2" 
                title={t('intro.steps.step2.title')} 
                description={t('intro.steps.step2.description')} 
                icon="fa-copy" 
                color="bg-blue-500/10" 
              />
              <StepCard 
                step="3" 
                title={t('intro.steps.step3.title')} 
                description={t('intro.steps.step3.description')} 
                icon="fa-envelope-open-text" 
                color="bg-green-500/10" 
              />
            </div>
          </section>
          
          {/* 使用场景 */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('intro.useCases.title')}</h2>
              <p className="text-lg text-muted-foreground">{t('intro.useCases.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card rounded-2xl p-8 border text-center hover:shadow-xl transition-shadow group">
                <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <i className="fas fa-check-circle text-3xl text-blue-500"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{t('intro.useCases.verification.title')}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{t('intro.useCases.verification.description')}</p>
              </div>
              <div className="bg-card rounded-2xl p-8 border text-center hover:shadow-xl transition-shadow group">
                <div className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <i className="fas fa-download text-3xl text-green-500"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{t('intro.useCases.downloads.title')}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{t('intro.useCases.downloads.description')}</p>
              </div>
              <div className="bg-card rounded-2xl p-8 border text-center hover:shadow-xl transition-shadow group">
                <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <i className="fas fa-user-shield text-3xl text-purple-500"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{t('intro.useCases.privacy.title')}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{t('intro.useCases.privacy.description')}</p>
              </div>
              <div className="bg-card rounded-2xl p-8 border text-center hover:shadow-xl transition-shadow group">
                <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <i className="fas fa-code text-3xl text-orange-500"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{t('intro.useCases.testing.title')}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{t('intro.useCases.testing.description')}</p>
              </div>
              <div className="bg-card rounded-2xl p-8 border text-center hover:shadow-xl transition-shadow group">
                <div className="w-20 h-20 rounded-2xl bg-pink-500/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <i className="fas fa-comments text-3xl text-pink-500"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{t('intro.useCases.forum.title')}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{t('intro.useCases.forum.description')}</p>
              </div>
              <div className="bg-card rounded-2xl p-8 border text-center hover:shadow-xl transition-shadow group">
                <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <i className="fas fa-shopping-cart text-3xl text-yellow-500"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{t('intro.useCases.shopping.title')}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{t('intro.useCases.shopping.description')}</p>
              </div>
            </div>
          </section>
          
          {/* 安全提示 */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('intro.security.title')}</h2>
              <p className="text-lg text-muted-foreground">{t('intro.security.subtitle')}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border-2 border-yellow-500/30 rounded-2xl p-8 space-y-5 security-warning-card">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-exclamation-triangle text-xl text-yellow-500"></i>
                </div>
                <p className="text-base leading-relaxed break-words">{t('intro.security.warning1')}</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-trash-alt text-xl text-red-500"></i>
                </div>
                <p className="text-base leading-relaxed break-words">{t('intro.security.warning3')}</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-clock text-xl text-orange-500"></i>
                </div>
                <p className="text-base leading-relaxed break-words">{t('intro.security.warning4')}</p>
              </div>
            </div>
          </section>
          
          {/* FAQ */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('intro.faq.title')}</h2>
              <p className="text-lg text-muted-foreground">{t('intro.faq.subtitle')}</p>
            </div>
            <div className="bg-card rounded-2xl border-2 p-8">
              <FAQItem question={t('intro.faq.q1.question')} answer={t('intro.faq.q1.answer')} />
              <FAQItem question={t('intro.faq.q2.question')} answer={t('intro.faq.q2.answer')} />
              <FAQItem question={t('intro.faq.q3.question')} answer={t('intro.faq.q3.answer')} />
              <FAQItem question={t('intro.faq.q4.question')} answer={t('intro.faq.q4.answer')} />
            </div>
          </section>
          
          {/* CTA */}
          {!mailbox && (
            <section className="bg-gradient-to-br from-primary/10 to-blue-600/10 rounded-3xl p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('intro.cta.title')}</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{t('intro.cta.subtitle')}</p>
              <button
                onClick={() => setShowPasswordDialog(true)}
                className="px-14 py-5 text-xl rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-2xl hover:shadow-primary/30 font-bold"
              >
                <i className="fas fa-rocket mr-2"></i>
                {t('intro.cta.btn')}
              </button>
            </section>
          )}
        </div>
    </Container>
  );
};

export default HomePage;

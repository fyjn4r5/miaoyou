import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { MailboxContext } from '../contexts/MailboxContext';
import LanguageSwitcher from './LanguageSwitcher';
import HeaderMailbox from './HeaderMailbox';
import Container from './Container';
import ThemeSwitcher from './ThemeSwitcher';

interface HeaderProps {
  mailbox: (Mailbox & { password: string }) | null;
  onMailboxChange?: (mailbox: Mailbox & { password: string }) => void;
  isLoading?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  mailbox = null, 
  onMailboxChange = () => {}, 
  isLoading = false 
}) => {
  const { t } = useTranslation();
  const { emailDomains, selectedDomain, setSelectedDomain, setShowPasswordDialog } = useContext(MailboxContext);
  
  return (
    <header className="border-b">
      <Container>
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="text-2xl font-bold">
            {t('app.title')}
          </Link>
          
          <div className="flex items-center gap-3">
            {/* 域名选择器（始终显示） */}
            {emailDomains.length > 1 && (
              <select 
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                {emailDomains.map(d => (
                  <option key={d} value={d}>@{d}</option>
                ))}
              </select>
            )}
            
            {mailbox && (
              <div className="flex items-center bg-muted/70 rounded-md px-3 py-1.5">
                <HeaderMailbox 
                  mailbox={mailbox} 
                  onMailboxChange={onMailboxChange}
                  isLoading={isLoading}
                />
                <div className="ml-3 pl-3 border-l border-muted-foreground/20 flex items-center">
                  <ThemeSwitcher />
                  <LanguageSwitcher />
                  <a
                    href="https://github.com/fyjn4r5/miaoyou"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-primary/20 hover:text-primary hover:scale-110 ml-1"
                    aria-label="GitHub"
                    title="GitHub"
                  >
                    <i className="fab fa-github text-base"></i>
                  </a>
                </div>
              </div>
            )}
            
            {!mailbox && (
              <div className="flex items-center bg-muted/70 rounded-md px-3 py-1.5">
                <ThemeSwitcher />
                <LanguageSwitcher />
                <a
                  href="https://github.com/fyjn4r5/miaoyou"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-primary/20 hover:text-primary hover:scale-110 ml-1"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <i className="fab fa-github text-base"></i>
                </a>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;

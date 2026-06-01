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
  
  return (
    <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-40">
      <Container>
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight hover:text-primary transition-colors">
            {t('app.title')}
          </Link>
          
          <div className="flex items-center bg-muted/60 rounded-xl px-3 py-1.5 shadow-sm">
            {mailbox && (
              <HeaderMailbox 
                mailbox={mailbox} 
                onMailboxChange={onMailboxChange}
                isLoading={isLoading}
              />
            )}
            
            <div className={`flex items-center ${mailbox ? 'ml-3 pl-3 border-l border-border' : ''}`}>
              <ThemeSwitcher />
              <LanguageSwitcher />
              <a
                href="https://ip.alice7.eu.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 h-9 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-primary/15 hover:text-primary ml-1.5 text-sm font-semibold whitespace-nowrap"
                title="真实地址生成器"
              >
                真实地址生成器
              </a>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;

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
    <header className="border-b">
      <Container>
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="text-2xl font-bold">
            {t('app.title')}
          </Link>
          
          <div className="flex items-center bg-muted/70 rounded-md px-3 py-1.5">
            {mailbox && (
              <HeaderMailbox 
                mailbox={mailbox} 
                onMailboxChange={onMailboxChange}
                isLoading={isLoading}
              />
            )}
            
            <div className={`flex items-center ${mailbox ? 'ml-3 pl-3 border-l border-muted-foreground/20' : ''}`}>
              <ThemeSwitcher />
              <LanguageSwitcher />

            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;

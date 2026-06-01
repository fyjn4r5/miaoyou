import React from 'react';
import { useTranslation } from 'react-i18next';
import { RandomName } from '../utils/nameGenerator';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  randomName: RandomName;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, onClose, randomName }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // silent
    }
  };

  interface InfoItemProps {
    label: string;
    value: string;
  }

  const InfoRow: React.FC<InfoItemProps> = ({ label, value }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-muted/50 last:border-0">
      <span className="text-xs text-muted-foreground min-w-[80px]">{label}</span>
      <div className="flex items-center gap-1.5 flex-1 justify-end">
        <span className="text-sm font-mono text-right truncate max-w-[200px]">{value}</span>
        <button
          onClick={() => copyToClipboard(value, label)}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-primary shrink-0"
          title={label}
        >
          <i className="fas fa-copy text-xs"></i>
        </button>
      </div>
    </div>
  );

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">{title}</h4>
      <div className="bg-muted/30 rounded-md px-3 py-1">{children}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background rounded-lg shadow-xl w-[420px] max-w-[95vw] max-h-[85vh] mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-base font-bold">{t('email.userInfo')}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <Section title={t('email.sectionPersonal')}>
            <InfoRow label={t('email.fullName')} value={randomName.fullName} />
            <InfoRow label={t('email.firstName')} value={randomName.firstName} />
            <InfoRow label={t('email.lastName')} value={randomName.lastName} />
            <InfoRow label={t('email.gender')} value={randomName.gender} />
            <InfoRow label={t('email.birthday')} value={randomName.birthday} />
            <InfoRow label={t('email.title')} value={randomName.title} />
          </Section>

          <Section title={t('email.sectionAddress')}>
            <InfoRow label={t('email.streetAddress')} value={randomName.streetAddress} />
            <InfoRow label={t('email.city')} value={randomName.city} />
            <InfoRow label={t('email.state')} value={`${randomName.state} (${randomName.stateFull})`} />
            <InfoRow label={t('email.zipCode')} value={randomName.zipCode} />
          </Section>

          <Section title={t('email.sectionContact')}>
            <InfoRow label={t('email.telephone')} value={randomName.telephone} />
          </Section>

          <Section title={t('email.sectionAccount')}>
            <InfoRow label={t('email.username')} value={randomName.username} />
            <InfoRow label={t('email.password')} value={randomName.password} />
          </Section>

          <Section title={t('email.sectionWork')}>
            <InfoRow label={t('email.company')} value={randomName.company} />
            <InfoRow label={t('email.occupation')} value={randomName.occupation} />
          </Section>

          <Section title={t('email.sectionFinancial')}>
            <InfoRow label={t('email.ssn')} value={randomName.ssn} />
            <InfoRow label={t('email.creditCardType')} value={randomName.creditCardType} />
            <InfoRow label={t('email.creditCardNumber')} value={randomName.creditCardNumber} />
            <InfoRow label={t('email.cvv2')} value={randomName.cvv2} />
            <InfoRow label={t('email.expires')} value={randomName.expires} />
          </Section>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;

import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Container from "./Container";
import { getStats } from "../utils/api";
import { generateRandomName } from "../utils/nameGenerator";

interface FooterProps {
  onShowInfo: (infoType: "privacy" | "terms" | "about") => void;
}

const Footer: React.FC<FooterProps> = ({ onShowInfo }) => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const [mailboxCount, setMailboxCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const randomName = useMemo(() => generateRandomName(), []);

  useEffect(() => {
    const fetchStats = async () => {
      const result = await getStats();
      if (result.success && result.stats) {
        setMailboxCount(result.stats.mailboxCount);
      }
    };
    fetchStats();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(randomName.username);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <footer className="border-t py-6">
      <Container>
        <div className="text-center text-sm text-muted-foreground">
          {mailboxCount !== null && (
            <p className="mb-2 text-primary font-medium">
              {t("footer.mailboxCount", { count: mailboxCount })}
            </p>
          )}
          <p className="mb-2">
            © {year} {t("app.title")}
          </p>
          <p className="mb-2">
            <span className="text-muted-foreground">{t("email.randomAlias")}: </span>
            <button
              onClick={handleCopy}
              className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
              title={t("email.copyUsername")}
            >
              {randomName.fullName} · {randomName.username}
            </button>
            {copied && (
              <span className="ml-1 text-green-500 text-xs">{t('common.copied')}</span>
            )}
          </p>
          <div className="flex flex-wrap justify-center items-center space-x-4 mb-2">
            <button
              onClick={() => onShowInfo("privacy")}
              className="hover:text-primary transition-colors"
            >
              {t("common.privacyPolicy", "隐私政策")}
            </button>
            <button
              onClick={() => onShowInfo("terms")}
              className="hover:text-primary transition-colors"
            >
              {t("common.terms", "使用条款")}
            </button>
            <button
              onClick={() => onShowInfo("about")}
              className="hover:text-primary transition-colors"
            >
              {t("common.about", "关于我们")}
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

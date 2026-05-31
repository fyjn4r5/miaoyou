import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import Container from "./Container";
import { getStats } from "../utils/api";
import { generateRandomName } from "../utils/nameGenerator";

// 定义 props 类型，允许父组件传递控制弹窗显示的函数
interface FooterProps {
  onShowInfo: (infoType: "privacy" | "terms" | "about") => void;
}

const Footer: React.FC<FooterProps> = ({ onShowInfo }) => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const [mailboxCount, setMailboxCount] = useState<number | null>(null);
  const [showNameGen, setShowNameGen] = useState(false);
  const [footerName, setFooterName] = useState<ReturnType<typeof generateRandomName> | null>(null);
  const genRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!footerName) setFooterName(generateRandomName());
  }, [footerName]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (genRef.current && !genRef.current.contains(e.target as Node)) {
        setShowNameGen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const regenerate = () => setFooterName(generateRandomName());

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  useEffect(() => {
    const fetchStats = async () => {
      const result = await getStats();
      if (result.success && result.stats) {
        setMailboxCount(result.stats.mailboxCount);
      }
    };
    fetchStats();
  }, []);

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
          <div className="relative inline-block mb-2">
            <div className="relative" ref={genRef}>
              <button
                onClick={() => setShowNameGen(!showNameGen)}
                className="text-xs underline underline-offset-2 hover:text-primary transition-colors"
              >
                真实地址生成器
              </button>
              {showNameGen && footerName && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border rounded-xl shadow-xl p-4 text-left whitespace-nowrap z-50">
                  <div className="flex justify-end gap-4 mb-2">
                    <button onClick={regenerate} className="text-xs text-primary hover:text-primary/80" title="换一个">
                      <i className="fas fa-sync-alt"></i>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <span className="font-medium">{footerName.firstName}</span>
                    <button onClick={() => copyToClipboard(footerName.firstName)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary" title="复制名">
                      <i className="fas fa-copy text-[10px]"></i>
                    </button>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-medium">{footerName.lastName}</span>
                    <button onClick={() => copyToClipboard(footerName.lastName)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary" title="复制姓">
                      <i className="fas fa-copy text-[10px]"></i>
                    </button>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-medium">{footerName.fullName}</span>
                    <button onClick={() => copyToClipboard(footerName.fullName)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary" title="复制姓名">
                      <i className="fas fa-copy text-[10px]"></i>
                    </button>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-medium">{footerName.username}</span>
                    <button onClick={() => copyToClipboard(footerName.username)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary" title="复制用户名">
                      <i className="fas fa-copy text-[10px]"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

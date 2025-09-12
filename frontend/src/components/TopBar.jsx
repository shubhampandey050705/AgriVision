import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import LangSelect from "./LangSelect";
import { motion } from "framer-motion";

export default function TopBar() {
  const { t } = useTranslation();
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="container flex items-center justify-between py-4"
    >
      <div className="text-xl font-bold tracking-tight">
        {t("appName")}
      </div>
      <div className="flex items-center gap-3">
        <LangSelect />
        <ThemeToggle />
      </div>
    </motion.header>
  );
}
